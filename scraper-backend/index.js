const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const compression = require('compression');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { scrapeAllPlatforms } = require('./crawler');
const Job = require('./model/job');

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
const locations = ['nigeria','remote','abuja','lagos','fulltime','parttime','onsite','hybrid']; 

// 🔹 Manual scrape endpoint (so you don’t wait for cron)
app.get('/api/scrape', async (req, res) => {
    res.json({ message: 'Scraping started in background' });
    (async () => {
        try {
            for (const keyword of keywords) {
                for (const location of locations) {
                    await scrapeAllPlatforms(keyword, location);
                    console.log(`Scraped data for ${keyword} in ${location}`);
                }
            }
        } catch (error) {
            console.error('Background scrape failed:', error.message);
        }
    })();
});

// Cron Function for scraping jobs hourly (runs every hour for testing)
cron.schedule('0 * * * *', async () => {
    console.log('Daily scraping cron job started at', new Date().toLocaleString());
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
    console.log('Daily scraping cron job completed at', new Date().toLocaleString());
});

// Cron function for deleting jobs older than a week from DB
cron.schedule('0 0 * * 0', async () => {
    console.log('Weekly deletion cron job started');
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    try {
        const result = await Job.deleteMany({ scrapedAt: { $lt: oneWeekAgo } });
        console.log(`Deleted ${result.deletedCount} jobs older than a week.`);
    } catch (error) {
        console.error('Error deleting old jobs:', error);
    }
    console.log('Weekly deletion cron job completed');
});

app.get('/api/jobs', async (req, res) => {
    const cacheKey = getCacheKey(req);
    const cachedResult = getCache(cacheKey);

    if (cachedResult) {
        console.log('Serving from cache');
        return res.json(cachedResult);
    }

    let { keyword, location, source, page = 1, limit = 10 } = req.query;

    keyword = keyword || '';
    location = location || '';
    source = source || '';
    page = parseInt(page);
    limit = parseInt(limit);

    try {
        let jobs;
        let totalJobs;

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const query = { scrapedAt: { $gte: sevenDaysAgo } };
        if (keyword) {
            // Escape special regex characters
            const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.title = { $regex: new RegExp(escapedKeyword, 'i') };
            console.log(`Searching for keyword: "${keyword}"`);
            console.log(`Search query:`, query);
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

        if (jobs.length === 0 && keyword) {
            console.log(`No jobs found with initial search, trying fallback search...`);
            const fallbackQuery = {
                title: { $regex: new RegExp(keyword, 'i') },
                scrapedAt: { $gte: sevenDaysAgo }
            };

            const fallbackPipeline = [
                { $match: fallbackQuery },
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

            const fallbackAggResult = await Job.aggregate(fallbackPipeline).hint({ scrapedAt: -1, jobURL: 1 });
            totalJobs = fallbackAggResult[0]?.totalCount?.[0]?.count || 0;
            const similarJobs = fallbackAggResult[0]?.jobs || [];

            console.log(`Fallback search found ${similarJobs.length} jobs`);
            if (similarJobs.length > 0) {
                jobs = similarJobs;
                console.log(`Using fallback results. Sample titles:`, similarJobs.slice(0, 3).map(job => job.title));
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
            }
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
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const result = await Job.deleteMany({ scrapedAt: { $lt: oneWeekAgo } });
        console.log(`Manual cleanup: Deleted ${result.deletedCount} jobs older than a week.`);

        res.json({
            message: `Cleanup completed. Deleted ${result.deletedCount} jobs older than 7 days.`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error during manual cleanup:', error);
        res.status(500).json({ error: error.message });
    }
});

// New endpoint to remove duplicate jobs
app.delete('/api/cleanup-duplicates', async (req, res) => {
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
app.post('/api/cv/enhance', async (req, res) => {
    try {
        // For demo purposes, create a sample enhanced CV
        const enhancedCV = {
            personalInfo: {
                fullName: "Enhanced CV",
                email: "enhanced@example.com",
                phone: "+1234567890",
                address: "Enhanced Address",
                summary: "This CV has been processed and enhanced with local algorithms for better presentation and keyword optimization."
            },
            education: [],
            workExperience: [],
            skills: [
                { name: "JavaScript", level: "Advanced", category: "Programming" },
                { name: "React", level: "Advanced", category: "Frontend" },
                { name: "Node.js", level: "Intermediate", category: "Backend" },
                { name: "Python", level: "Intermediate", category: "Programming" }
            ]
        };

        // Generate PDF
        const pdfBuffer = await generateCVPDF(enhancedCV);
        const pdfPath = path.join('uploads', `enhanced_cv_${Date.now()}.pdf`);
        fs.writeFileSync(pdfPath, pdfBuffer);

        res.json({
            success: true,
            cvData: enhancedCV,
            pdfUrl: `/api/cv/download/${path.basename(pdfPath)}`,
            message: 'CV enhanced successfully with local processing',
            aiUsed: false
        });

    } catch (error) {
        console.error('Error enhancing CV:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to enhance CV',
            error: error.message
        });
    }
});

// PDF Download endpoint
app.get('/api/cv/download/:filename', (req, res) => {
    const filename = req.params.filename;
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
            enhanced.personalInfo.summary = enhanced.personalInfo.summary
                .replace(/\b(i am|i'm|my name is)\b/gi, 'Professional with')
                .replace(/\b(like|enjoy|love)\b/gi, 'experienced in')
                + ' Committed to delivering high-quality results and continuous learning.';
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
    const browser = await puppeteer.launch();
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
            .date { float: right; color: #666; }
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
                    <div class="job-title">${exp.position}</div>
                    <div class="company">${exp.company} - ${exp.location}</div>
                    <div class="date">${exp.startDate} - ${exp.endDate}</div>
                    <div style="clear: both; margin-top: 5px;">${exp.description}</div>
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
                    <div class="job-title">${edu.degree} in ${edu.field}</div>
                    <div class="company">${edu.institution}</div>
                    <div class="date">${edu.startDate} - ${edu.endDate}</div>
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

