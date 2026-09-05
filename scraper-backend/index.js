const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const compression = require('compression');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
require('dotenv').config();
const { scrapeAllPlatforms } = require('./crawler');
const Job = require('./model/job');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and .docx files are supported'));
        }
    }
});

// Simple in-memory cache for performance
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(req) {
    return `${req.originalUrl}_${JSON.stringify(req.query)}`;
}

function setCache(key, data) {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
}

function getCache(key) {
    const cached = cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return cached.data;
    }
    cache.delete(key); // Remove expired cache
    return null;
}

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(compression()); // Enable gzip compression for better performance
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies

// Guards routes that are cheap to abuse (bulk-delete data, trigger an
// expensive Puppeteer scrape cycle) but have no real UI/user in front of
// them — just a shared secret checked against a header, since the only
// callers are the site owner and an external cron trigger, not end users.
function requireAdminKey(req, res, next) {
    const configuredKey = process.env.ADMIN_API_KEY;
    if (!configuredKey) {
        // Fail closed: an unset key should block access, not silently allow it.
        return res.status(503).json({ error: 'This endpoint is not configured on this server' });
    }
    if (req.headers['x-admin-key'] !== configuredKey) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Database Connection Successful');

        // Create indexes for better query performance
        try {
            const Job = require('./model/job');

            // Index for deduplication and recent jobs filtering
            await Job.collection.createIndex(
                { jobURL: 1 },
                { unique: true, name: 'jobURL_unique' }
            );

            // Compound index for API queries (scrapedAt + jobURL for deduplication)
            await Job.collection.createIndex(
                { scrapedAt: -1, jobURL: 1 },
                { name: 'scrapedAt_jobURL' }
            );

            // Index for title searches
            await Job.collection.createIndex(
                { title: 1, scrapedAt: -1 },
                { name: 'title_scrapedAt' }
            );

            // Index for source filtering
            await Job.collection.createIndex(
                { source: 1, scrapedAt: -1 },
                { name: 'source_scrapedAt' }
            );

            // Index for location filtering
            await Job.collection.createIndex(
                { jobLocation: 1, scrapedAt: -1 },
                { name: 'jobLocation_scrapedAt' }
            );

            console.log('Database indexes created successfully');
        } catch (indexError) {
            console.warn('Some indexes may already exist:', indexError.message);
        }
    })
    .catch((e) => {
        console.error('Error connecting to MongoDB:', e.message);
    });

const keywords = ['developer', 'engineer', 'software', 'frontend', 'fullstack', 'backend', 'data', 'scientist', 'designer'];
// Real geographic locations only. 'fulltime'/'parttime'/'onsite'/'hybrid' used to be
// in this list, but they're job-type terms, not locations — sending them as the
// `location` search param to LinkedIn/Jobberman doesn't filter anything meaningful,
// it just burns scrape time. Job type is already classified per-job from its title/
// duration text in classifyJobType(), so nothing is lost by dropping them here.
const locations = ['nigeria', 'remote', 'abuja', 'lagos', 'port harcourt', 'ibadan', 'kano', 'enugu'];

// Prevents a scrape cycle from starting while a previous one (cron or manual) is
// still running. The full keyword x location matrix can take longer than the
// hourly cron interval, and without this guard, overlapping runs would stack up
// concurrent Puppeteer browsers and hammer the DB with duplicate writes.
let isScrapeRunning = false;

async function runFullScrapeCycle(trigger) {
    if (isScrapeRunning) {
        console.log(`Skipping ${trigger} scrape — a scrape cycle is already in progress`);
        return;
    }

    isScrapeRunning = true;
    console.log(`${trigger} scrape cycle started at`, new Date().toLocaleString());
    try {
        for (const keyword of keywords) {
            for (const location of locations) {
                try {
                    await scrapeAllPlatforms(keyword, location);
                    console.log(`Scraped data for ${keyword} in ${location} at ${new Date().toLocaleTimeString()}`);
                } catch (error) {
                    console.error(`Failed to scrape data for ${keyword} in ${location}:`, error);
                }
            }
        }
    } finally {
        isScrapeRunning = false;
        console.log(`${trigger} scrape cycle completed at`, new Date().toLocaleString());
    }
}

// Lightweight keep-alive target — no DB query, just an instant response.
// Render's free tier spins the whole service down after ~15 min of no
// incoming HTTP traffic, which kills the in-process cron scheduler along
// with it until the next request wakes it back up (and that wake can itself
// fail, surfacing as a 503 with x-render-routing: hibernate-wake-error to
// whatever tried to reach it). Point an external scheduler (e.g.
// cron-job.org) at this every ~10-14 minutes — comfortably under that
// 15-minute threshold — so the service never gets the chance to sleep, and
// the actual hourly /api/scrape trigger always lands on an already-warm
// instance instead of racing a cold start.
app.get('/api/ping', (req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
});

// 🔹 Manual scrape endpoint (so you don’t wait for cron)
app.get('/api/scrape', requireAdminKey, (req, res) => {
    if (isScrapeRunning) {
        return res.json({ message: 'A scrape is already in progress' });
    }
    res.json({ message: 'Scraping started in background' });
    runFullScrapeCycle('Manual').catch(error => {
        console.error('Background scrape failed:', error.message);
    });
});

// Cron Function for scraping jobs hourly (runs every hour for testing)
cron.schedule('0 * * * *', () => {
    runFullScrapeCycle('Hourly cron').catch(error => {
        console.error('Cron scrape failed:', error.message);
    });
});

// Cron function for deleting jobs older than the retention window from DB
cron.schedule('0 0 * * 0', async () => {
    console.log('Weekly deletion cron job started');
    const retentionCutoff = new Date();
    retentionCutoff.setDate(retentionCutoff.getDate() - 14);

    try {
        const result = await Job.deleteMany({ scrapedAt: { $lt: retentionCutoff } });
        console.log(`Deleted ${result.deletedCount} jobs older than 14 days.`);
    } catch (error) {
        console.error('Error deleting old jobs:', error);
    }
    console.log('Weekly deletion cron job completed');
});

// Same title-keyword classification as the frontend's JobCard.getJobLevel,
// kept in sync so the "Experience Level" filter matches what's actually
// shown on each card's level badge.
const EXPERIENCE_LEVEL_PATTERNS = {
    'Senior': /senior|lead|principal|head/i,
    'Mid-level': /mid|intermediate|experienced/i,
    'Entry': /junior|entry|graduate|trainee/i
};

app.get('/api/jobs', async (req, res) => {
    const cacheKey = getCacheKey(req);
    const cachedResult = getCache(cacheKey);

    if (cachedResult) {
        console.log('Serving from cache');
        return res.json(cachedResult);
    }

    let { keyword, location, source, level, page = 1, limit = 10 } = req.query;

    keyword = keyword || '';
    location = location || '';
    source = source || '';
    level = level || '';
    page = parseInt(page);
    limit = parseInt(limit);

    try {
        let jobs;
        let totalJobs;

        const retentionCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const query = { scrapedAt: { $gte: retentionCutoff } };

        // Both keyword and level match against `title`, so they're combined
        // via $and rather than one overwriting the other on `query.title`.
        const titleConditions = [];
        if (keyword) {
            // Escape special regex characters
            const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            titleConditions.push({ title: { $regex: new RegExp(escapedKeyword, 'i') } });
            console.log(`Searching for keyword: "${keyword}"`);
        }
        if (level && EXPERIENCE_LEVEL_PATTERNS[level]) {
            titleConditions.push({ title: { $regex: EXPERIENCE_LEVEL_PATTERNS[level] } });
            console.log(`Filtering by experience level: "${level}"`);
        }
        if (titleConditions.length === 1) {
            Object.assign(query, titleConditions[0]);
        } else if (titleConditions.length > 1) {
            query.$and = titleConditions;
        }

        if (location) {
            query.jobLocation = { $regex: new RegExp(location, 'i') };
        }
        if (source) {
            query.source = source;
            console.log(`Filtering by source: "${source}"`);
            console.log(`Query object:`, query);
        }

        // Use optimized aggregation to deduplicate by jobURL and randomize sources while keeping newest first
        const skip = (page - 1) * limit;
        const pipeline = [
            { $match: query },
            { $sort: { scrapedAt: -1 } },
            {
                $group: {
                    _id: "$jobURL",
                    doc: { $first: "$$ROOT" }
                }
            },
            {
                $replaceRoot: { newRoot: "$doc" }
            },
            {
                $addFields: {
                    randomSort: { $rand: {} }
                }
            },
            {
                $sort: {
                    scrapedAt: -1,
                    randomSort: 1
                }
            },
            {
                $facet: {
                    totalCount: [{ $count: "count" }],
                    jobs: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                companyName: 1,
                                jobLocation: 1,
                                jobType: 1,
                                salary: 1,
                                scrapedAt: 1,
                                source: 1,
                                jobURL: 1,
                                keyword: 1,
                                location: 1
                            }
                        }
                    ]
                }
            }
        ];

        const aggResult = await Job.aggregate(pipeline).hint({ scrapedAt: -1, jobURL: 1 });
        totalJobs = aggResult[0]?.totalCount?.[0]?.count || 0;
        jobs = aggResult[0]?.jobs || [];
        console.log(`Found ${jobs.length} jobs with initial search (page ${page}, limit ${limit})`);

        if (jobs.length > 0) {
            console.log(`Sample job titles:`, jobs.slice(0, 3).map(job => job.title));
        }

        // A genuine zero-match result (e.g. no Entry-level developer jobs in
        // Kano right now) is returned as-is here — this used to fall back to
        // a keyword-only search that silently dropped the level/location/
        // source filters and showed unrelated jobs instead, which looked
        // like the app had forgotten the filters the user just applied. The
        // frontend already renders a proper "No jobs found" empty state, so
        // there's no need to paper over an honest empty result.

        // On a genuine zero-match result, figure out which specific active
        // filter is the blocker — re-run the search with just that one
        // filter dropped (others kept) and see if it would then match
        // something. Only runs on the empty-result path, so the extra
        // queries are rare, not a cost on every normal search.
        const filterSuggestions = [];
        if (totalJobs === 0) {
            const activeFilters = [];
            if (keyword) activeFilters.push({ key: 'keyword', label: 'Search Keyword' });
            if (level && EXPERIENCE_LEVEL_PATTERNS[level]) activeFilters.push({ key: 'level', label: 'Experience Level' });
            if (location) activeFilters.push({ key: 'location', label: 'Job Location' });
            if (source) activeFilters.push({ key: 'source', label: 'Job Source' });

            for (const filter of activeFilters) {
                const relaxedQuery = { scrapedAt: { $gte: retentionCutoff } };
                const relaxedTitleConditions = [];
                if (keyword && filter.key !== 'keyword') {
                    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    relaxedTitleConditions.push({ title: { $regex: new RegExp(escapedKeyword, 'i') } });
                }
                if (level && EXPERIENCE_LEVEL_PATTERNS[level] && filter.key !== 'level') {
                    relaxedTitleConditions.push({ title: { $regex: EXPERIENCE_LEVEL_PATTERNS[level] } });
                }
                if (relaxedTitleConditions.length === 1) {
                    Object.assign(relaxedQuery, relaxedTitleConditions[0]);
                } else if (relaxedTitleConditions.length > 1) {
                    relaxedQuery.$and = relaxedTitleConditions;
                }
                if (location && filter.key !== 'location') {
                    relaxedQuery.jobLocation = { $regex: new RegExp(location, 'i') };
                }
                if (source && filter.key !== 'source') {
                    relaxedQuery.source = source;
                }

                const countResult = await Job.aggregate([
                    { $match: relaxedQuery },
                    { $group: { _id: "$jobURL" } },
                    { $count: "count" }
                ]);
                const matchCount = countResult[0]?.count || 0;
                if (matchCount > 0) {
                    filterSuggestions.push({ filter: filter.key, label: filter.label, matchCount });
                }
            }
        }

        const totalPages = Math.ceil(totalJobs / limit);

        const result = {
            jobs,
            pagination: {
                currentPage: page,
                totalPages,
                totalJobs,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            filterSuggestions
        };

        // Cache the result
        setCache(cacheKey, result);

        res.json(result);
    } catch (error) {
        console.error('Error fetching job data:', error);
        res.status(500).send('Error fetching job listings');
    }
});

// Debug endpoint to see all job titles with ages and new fields
app.get('/api/debug/jobs', async (req, res) => {
    try {
        const allJobs = await Job.find({}, 'title scrapedAt source jobType salary').sort({ scrapedAt: -1 }).limit(50);
        const jobs = allJobs.map(job => ({
            title: job.title,
            scrapedAt: job.scrapedAt,
            source: job.source,
            jobType: job.jobType,
            salary: job.salary,
            age: Math.floor((Date.now() - new Date(job.scrapedAt)) / (1000 * 60 * 60 * 24)) + ' days ago'
        }));
        res.json({
            totalJobs: allJobs.length,
            jobs: jobs,
            hrJobs: jobs.filter(job => job.title.toLowerCase().includes('hr'))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manual cleanup endpoint to remove old jobs
// New endpoint to fetch latest 50 jobs sorted by createdAt descending
app.get('/api/results', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 }).limit(50);
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).send('Error fetching job results');
    }
});
app.delete('/api/cleanup', async (req, res) => {
    try {
        const retentionCutoff = new Date();
        retentionCutoff.setDate(retentionCutoff.getDate() - 14);

        const result = await Job.deleteMany({ scrapedAt: { $lt: retentionCutoff } });
        console.log(`Manual cleanup: Deleted ${result.deletedCount} jobs older than 14 days.`);

        res.json({
            message: `Cleanup completed. Deleted ${result.deletedCount} jobs older than 14 days.`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error during manual cleanup:', error);
        res.status(500).json({ error: error.message });
    }
});

// New endpoint to remove duplicate jobs
app.delete('/api/cleanup-duplicates', requireAdminKey, async (req, res) => {
    try {
        // Use MongoDB aggregation to find duplicates with their scrapedAt timestamps
        const duplicates = await Job.aggregate([
            {
                $group: {
                    _id: {
                        title: "$title",
                        companyName: "$companyName",
                        jobLocation: "$jobLocation"
                    },
                    jobs: {
                        $push: {
                            _id: "$_id",
                            scrapedAt: "$scrapedAt"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        let totalDeleted = 0;

        for (const duplicate of duplicates) {
            // Sort jobs by scrapedAt timestamp (newest first)
            const sortedJobs = duplicate.jobs.sort((a, b) =>
                new Date(b.scrapedAt) - new Date(a.scrapedAt)
            );

            // Keep the most recent one, delete the rest
            const idsToDelete = sortedJobs.slice(1).map(job => job._id);
            if (idsToDelete.length > 0) {
                const result = await Job.deleteMany({ _id: { $in: idsToDelete } });
                totalDeleted += result.deletedCount;
                console.log(`Removed ${result.deletedCount} duplicates for: ${duplicate._id.title} at ${duplicate._id.companyName}`);
            }
        }

        res.json({
            message: `Duplicate cleanup completed. Removed ${totalDeleted} duplicate jobs.`,
            deletedCount: totalDeleted,
            duplicateGroups: duplicates.length
        });
    } catch (error) {
        console.error('Error during duplicate cleanup:', error);
        res.status(500).json({ error: error.message });
    }
});

// CV Generation endpoint - works without external APIs
app.post('/api/cv/generate', async (req, res) => {
    try {
        const { cvData, targetJob, enhanceContent, optimizeKeywords } = req.body;

        let enhancedCV = { ...cvData };

        // Simple local enhancement logic (no external API needed)
        if (enhanceContent || optimizeKeywords) {
            enhancedCV = enhanceCVLocally(cvData, targetJob, enhanceContent, optimizeKeywords);
        }

        // Generate PDF
        const pdfBuffer = await generateCVPDF(enhancedCV);

        // Save PDF temporarily
        const pdfPath = path.join('uploads', `cv_${Date.now()}.pdf`);
        fs.writeFileSync(pdfPath, pdfBuffer);

        res.json({
            success: true,
            cvData: enhancedCV,
            pdfUrl: `/api/cv/download/${path.basename(pdfPath)}`,
            message: 'CV generated successfully with local enhancement',
            aiUsed: false
        });

    } catch (error) {
        console.error('Error generating CV:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate CV',
            error: error.message
        });
    }
});

// CV Enhancement endpoint (upload existing CV)
app.post('/api/cv/enhance', (req, res) => {
    upload.single('cvFile')(req, res, async (uploadError) => {
        if (uploadError) {
            return res.status(400).json({ success: false, message: uploadError.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No CV file was uploaded' });
            }

            const { targetJob, enhanceContent, optimizeKeywords } = req.body;

            const text = await extractTextFromFile(req.file);
            let parsedCV = parseCVText(text);

            if (enhanceContent === 'true' || optimizeKeywords === 'true') {
                parsedCV = enhanceCVLocally(
                    parsedCV,
                    targetJob,
                    enhanceContent === 'true',
                    optimizeKeywords === 'true'
                );
            }

            // Generate PDF
            const pdfBuffer = await generateCVPDF(parsedCV);
            const pdfPath = path.join('uploads', `enhanced_cv_${Date.now()}.pdf`);
            fs.writeFileSync(pdfPath, pdfBuffer);

            res.json({
                success: true,
                cvData: parsedCV,
                pdfUrl: `/api/cv/download/${path.basename(pdfPath)}`,
                message: 'CV parsed and enhanced from your uploaded file. Automatic parsing is best-effort — please review the extracted details before downloading.',
                aiUsed: false
            });

        } catch (error) {
            console.error('Error enhancing CV:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to enhance CV',
                error: error.message
            });
        }
    });
});

// Extract raw text from an uploaded PDF or DOCX file
async function extractTextFromFile(file) {
    if (file.mimetype === 'application/pdf') {
        const parser = new pdfParse.PDFParse({ data: file.buffer });
        try {
            const result = await parser.getText();
            return result.text;
        } finally {
            await parser.destroy();
        }
    }
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        return result.value;
    }
    throw new Error('Unsupported file format. Please upload a PDF or .docx file.');
}

const DATE_RANGE_RE = /((?:19|20)\d{2}|present)\s*(?:-|–|—|to)\s*((?:19|20)\d{2}|present)/i;
const DEGREE_RE = /\b(B\.?Sc\.?|M\.?Sc\.?|Bachelor'?s?(?:\s+of\s+\w+)?|Master'?s?(?:\s+of\s+\w+)?|Ph\.?D\.?|HND|OND|Diploma|B\.?A\.?|M\.?A\.?|MBA)\b[^,;\n]*/i;
const INSTITUTION_RE = /\b(university|polytechnic|institute|college|school)\b/i;

// Removes a date-range substring from a line (rather than discarding the
// whole line), since some layouts put a title and its date on one physical
// line — a flex/table row like "Position    2020 - Present" extracts as a
// single line with the two parts separated by whitespace/tabs, not a break.
function stripDate(line) {
    return line.replace(DATE_RANGE_RE, '').replace(/\s+/g, ' ').trim();
}

// Groups a section's lines into entries by closing one once it has both a
// date and enough signal to look complete. Closes on a date-range line only
// once the accumulated text has BOTH a degree and an institution match —
// not on the date alone, since some layouts (including this app's own CV
// template) put the date on the same line as the degree via a flex/table
// row, with the institution trailing on the next line; closing on that
// first line alone would split one entry into two. The 4-line cap is a
// safety valve for entries that never get an institution match (e.g. a
// self-taught/bootcamp line with no recognizable institution keyword) so
// they don't silently swallow every entry after them into one giant blob.
// Deliberately NOT used for work experience: experience entries usually
// have description bullets trailing after the date ("Position / Dates /
// bullet / bullet"), and closing there would fragment a single job into
// bogus multi-entry garbage.
function splitOnTrailingDate(sectionLines) {
    const entries = [];
    let current = [];
    for (const line of sectionLines) {
        current.push(line);
        if (DATE_RANGE_RE.test(line)) {
            const text = current.join(' ');
            if ((DEGREE_RE.test(text) && INSTITUTION_RE.test(text)) || current.length >= 4) {
                entries.push(current);
                current = [];
            }
        }
    }
    if (current.length > 0) entries.push(current);
    return entries;
}

function parseEducationEntry(entryLines) {
    const text = entryLines.join(' ');
    const dateMatch = text.match(DATE_RANGE_RE);
    const contentLines = entryLines.map(stripDate).filter(Boolean);

    const degreeLine = contentLines.find(l => DEGREE_RE.test(l));
    const degreeMatch = degreeLine ? degreeLine.match(DEGREE_RE) : null;
    const institutionLine = contentLines.find(l => INSTITUTION_RE.test(l)) || '';

    return {
        institution: institutionLine.trim(),
        degree: degreeMatch ? degreeMatch[0].trim() : '',
        field: '',
        startDate: dateMatch ? dateMatch[1] : '',
        endDate: dateMatch ? dateMatch[2] : '',
        gpa: '',
        description: entryLines.join('\n')
    };
}

// Work experience is kept as a single entry rather than split, since reliably
// telling "end of this job's bullets" from "start of the next job's title"
// isn't safe with plain regex. Position/company/dates are pulled from the
// first match found; the full section text always goes into description so
// later jobs aren't lost, just not broken out into their own entry.
function parseExperienceSection(sectionLines) {
    if (sectionLines.length === 0) return [];

    const dateMatch = sectionLines.join(' ').match(DATE_RANGE_RE);
    const contentLines = sectionLines.map(stripDate).filter(Boolean);
    const titleLine = contentLines[0] || '';

    let position = titleLine;
    let company = '';

    const atMatch = titleLine.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i);
    if (atMatch) {
        position = atMatch[1].trim();
        company = atMatch[2].trim();
    } else if (contentLines[1]) {
        // Common two-line layout (e.g. this app's own CV template):
        // "Position" then "Company - Location" / "Company, Location"
        company = contentLines[1].split(/\s*[-,]\s*/)[0].trim();
    }

    return [{
        company,
        position,
        startDate: dateMatch ? dateMatch[1] : '',
        endDate: dateMatch ? dateMatch[2] : '',
        location: '',
        description: sectionLines.join('\n')
    }];
}

// Splits a raw skills blob into individual entries. Most resumes separate
// skills with commas/bullets/pipes, but PDFs generated from tightly-packed
// "Name (Level)" spans (like this app's own CV template) can lose all
// whitespace between entries — fall back to splitting right after each ")"
// and strip the trailing "(Level)" so it isn't baked into the name.
function extractSkillNames(sectionLines) {
    const blob = sectionLines.join(' ');
    let parts = blob.split(/[,•|;]/).map(s => s.trim()).filter(Boolean);

    if (parts.length <= 1) {
        // Split right after each ")" (consuming any whitespace that follows,
        // but not the ")" itself) — covers both "A)B)" with no gap and "A) B)"
        // with a space, which is what a row of separately-styled inline-block
        // "Name (Level)" spans commonly extracts as.
        parts = blob.split(/(?<=\))\s*(?=\S)/).map(s => s.trim()).filter(Boolean);
    }

    return parts
        .map(s => s.replace(/\s*\([^)]*\)\s*$/, '').trim())
        .filter(s => s.length > 1 && s.length < 40);
}

// Best-effort local parsing of raw CV text into structured CVData. Regex/
// heuristics can't perfectly reconstruct a resume's layout, so this is
// intentionally conservative: it structures what it can find high confidence
// signals for (dates, degree keywords, institution/company names) and always
// keeps the full section text in `description` so nothing gets silently lost.
function parseCVText(text) {
    // pdf-parse emits page-boundary markers like "-- 1 of 1 --" as real text lines.
    // Left in, one can silently attach to whatever section happens to be last and
    // corrupt it (e.g. pushing a skills blob over the length filter below).
    const lines = text.split('\n').map(l => l.trim())
        .filter(Boolean)
        .filter(l => !/^--\s*\d+\s*of\s*\d+\s*--$/i.test(l));

    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    // Require either a leading '+' (international format) or at least 3
    // delimited digit groups — a bare 2-group "2015 - 2019" style date range
    // would otherwise match the older, looser version of this pattern.
    const phoneMatch = text.match(/\+\d[\d\s().-]{7,}\d/)
        || text.match(/\b\d{2,4}[\s.-]\d{2,4}[\s.-]\d{2,4}(?:[\s.-]\d{2,4})?\b/);
    const linkedinMatch = text.match(/https?:\/\/(www\.)?linkedin\.com\/\S+/i);
    const githubMatch = text.match(/https?:\/\/(www\.)?github\.com\/\S+/i);

    const sectionHeaders = {
        summary: /^(summary|profile|objective|professional summary|about me)\b/i,
        education: /^(education|academic background|qualifications)\b/i,
        workExperience: /^(experience|work experience|employment history|professional experience|work history)\b/i,
        skills: /^(skills|technical skills|core competencies|core skills|key skills)\b/i
    };
    const isHeaderLine = (line) => Object.values(sectionHeaders).some(re => re.test(line));

    // The name is usually the first short line that isn't contact info or a section header
    const fullName = lines.find(l =>
        l.length > 0 && l.length < 60 && !l.includes('@') && !/\d{3,}/.test(l) && !isHeaderLine(l)
    ) || '';

    const sections = {};
    let currentSection = null;
    for (const line of lines) {
        const matchedKey = Object.keys(sectionHeaders).find(key => sectionHeaders[key].test(line));
        if (matchedKey) {
            currentSection = matchedKey;
            sections[currentSection] = [];
            continue;
        }
        if (currentSection) {
            sections[currentSection].push(line);
        }
    }

    const skills = extractSkillNames(sections.skills || [])
        .slice(0, 20)
        .map(name => ({ name, level: 'Intermediate', category: 'General' }));

    const education = sections.education
        ? splitOnTrailingDate(sections.education).map(parseEducationEntry)
        : [];

    const workExperience = sections.workExperience
        ? parseExperienceSection(sections.workExperience)
        : [];

    return {
        personalInfo: {
            fullName,
            email: emailMatch ? emailMatch[0] : '',
            phone: phoneMatch ? phoneMatch[0].trim() : '',
            address: '',
            linkedin: linkedinMatch ? linkedinMatch[0] : '',
            github: githubMatch ? githubMatch[0] : '',
            website: '',
            summary: (sections.summary || []).join(' ').slice(0, 800)
        },
        education,
        workExperience,
        skills
    };
}

// PDF Download endpoint
app.get('/api/cv/download/:filename', (req, res) => {
    // path.basename strips any directory components (e.g. "../../.env"),
    // so this can never resolve outside uploads/ — without it, req.params.filename
    // went straight into path.join unsanitized, letting anyone download the
    // server's .env (MongoDB credentials) or any other readable file.
    const filename = path.basename(req.params.filename);
    const filePath = path.join('uploads', filename);

    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        // Clean up file after download
        fileStream.on('end', () => {
            fs.unlinkSync(filePath);
        });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Local CV enhancement function (no external APIs needed)
function enhanceCVLocally(cvData, targetJob, enhanceContent, optimizeKeywords) {
    const enhanced = { ...cvData };

    if (enhanceContent) {
        // Enhance summary
        if (enhanced.personalInfo.summary) {
            const closingLine = 'Committed to delivering high-quality results and continuous learning.';
            enhanced.personalInfo.summary = enhanced.personalInfo.summary
                .replace(/\b(i am|i'm|my name is)\b/gi, 'Professional with')
                .replace(/\b(like|enjoy|love)\b/gi, 'experienced in');
            // Re-enhancing an already-enhanced CV (e.g. re-uploading a
            // previously generated one) shouldn't pile up duplicate copies
            // of this sentence — only append if it isn't already there.
            if (!enhanced.personalInfo.summary.includes(closingLine)) {
                enhanced.personalInfo.summary += ' ' + closingLine;
            }
        }

        // Enhance work experience descriptions
        if (enhanced.workExperience) {
            enhanced.workExperience = enhanced.workExperience.map(exp => ({
                ...exp,
                description: exp.description
                    ? exp.description.replace(/\b(helped|worked|did)\b/gi, 'Successfully managed')
                    : 'Led key initiatives and delivered measurable results in a fast-paced environment.'
            }));
        }
    }

    if (optimizeKeywords && targetJob) {
        const jobKeywords = extractJobKeywords(targetJob);

        // Add relevant skills based on target job
        if (!enhanced.skills) enhanced.skills = [];

        jobKeywords.forEach(keyword => {
            if (!enhanced.skills.some(skill => skill.name.toLowerCase().includes(keyword.toLowerCase()))) {
                enhanced.skills.push({
                    name: keyword,
                    level: 'Intermediate',
                    category: 'Technical'
                });
            }
        });

        // Optimize summary with keywords
        if (enhanced.personalInfo.summary && !enhanced.personalInfo.summary.includes(jobKeywords[0])) {
            enhanced.personalInfo.summary += ` Skilled in ${jobKeywords.slice(0, 3).join(', ')}.`;
        }
    }

    return enhanced;
}

// Extract keywords from job title
function extractJobKeywords(jobTitle) {
    const keywords = {
        'developer': ['JavaScript', 'React', 'Node.js', 'Git', 'API Development'],
        'engineer': ['Problem Solving', 'System Design', 'Testing', 'Agile', 'DevOps'],
        'designer': ['UI/UX', 'Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
        'manager': ['Leadership', 'Team Management', 'Project Planning', 'Communication', 'Strategy'],
        'analyst': ['Data Analysis', 'SQL', 'Excel', 'Reporting', 'Business Intelligence']
    };

    const lowerTitle = jobTitle.toLowerCase();
    for (const [key, value] of Object.entries(keywords)) {
        if (lowerTitle.includes(key)) {
            return value;
        }
    }

    return ['Communication', 'Problem Solving', 'Teamwork', 'Adaptability', 'Leadership'];
}

// Function to generate PDF from CV data
async function generateCVPDF(cvData) {
    // Same launch args as crawler.js's createBrowser() — without --no-sandbox,
    // Chromium typically fails to launch at all in a Linux container (Render),
    // so CV generation would work locally but be completely broken in production.
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath()
    });
    const page = await browser.newPage();

    const html = generateCVHTML(cvData);

    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px'
        }
    });

    await browser.close();
    return pdfBuffer;
}

// Function to generate HTML for CV
function generateCVHTML(cvData) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${cvData.personalInfo.fullName} - CV</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .name { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .contact { font-size: 14px; color: #666; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; }
            .job-title { font-weight: bold; }
            .company { font-style: italic; color: #666; }
            .date { color: #666; white-space: nowrap; }
            .title-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
            .skill { display: inline-block; background: #f0f0f0; padding: 5px 10px; margin: 2px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="name">${cvData.personalInfo.fullName}</div>
            <div class="contact">
                ${cvData.personalInfo.email} | ${cvData.personalInfo.phone}<br>
                ${cvData.personalInfo.address}<br>
                ${cvData.personalInfo.linkedin ? `<a href="${cvData.personalInfo.linkedin}">LinkedIn</a> | ` : ''}
                ${cvData.personalInfo.github ? `<a href="${cvData.personalInfo.github}">GitHub</a> | ` : ''}
                ${cvData.personalInfo.website ? `<a href="${cvData.personalInfo.website}">Website</a>` : ''}
            </div>
        </div>

        <div class="section">
            <div class="section-title">Professional Summary</div>
            <p>${cvData.personalInfo.summary}</p>
        </div>

        ${cvData.workExperience && cvData.workExperience.length > 0 ? `
        <div class="section">
            <div class="section-title">Work Experience</div>
            ${cvData.workExperience.map(exp => `
                <div style="margin-bottom: 15px;">
                    <div class="title-row">
                        <div class="job-title">${exp.position}</div>
                        <div class="date">${exp.startDate} - ${exp.endDate}</div>
                    </div>
                    <div class="company">${exp.company} - ${exp.location}</div>
                    <div style="margin-top: 5px;">${exp.description}</div>
                    ${exp.achievements ? `<ul>${exp.achievements.map(ach => `<li>${ach}</li>`).join('')}</ul>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${cvData.education && cvData.education.length > 0 ? `
        <div class="section">
            <div class="section-title">Education</div>
            ${cvData.education.map(edu => `
                <div style="margin-bottom: 15px;">
                    <div class="title-row">
                        <div class="job-title">${edu.degree} in ${edu.field}</div>
                        <div class="date">${edu.startDate} - ${edu.endDate}</div>
                    </div>
                    <div class="company">${edu.institution}</div>
                    ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
                    ${edu.description ? `<div>${edu.description}</div>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${cvData.skills && cvData.skills.length > 0 ? `
        <div class="section">
            <div class="section-title">Skills</div>
            ${cvData.skills.map(skill => `<span class="skill">${skill.name} (${skill.level})</span>`).join('')}
        </div>
        ` : ''}
    </body>
    </html>
    `;
}

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
    console.log('Scheduling cron job');
});

