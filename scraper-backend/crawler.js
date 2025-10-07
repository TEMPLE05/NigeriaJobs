const puppeteerExtra = require('puppeteer-extra');
const puppeteer = require('puppeteer');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const Job = require('./model/job');

puppeteerExtra.use(pluginStealth());

// Helper functions for data processing
function classifyJobType(duration, title, location) {
    const text = (duration + ' ' + title + ' ' + location).toLowerCase();

    if (text.includes('contract') || text.includes('temporary')) return 'Contract';
    if (text.includes('part') || text.includes('part-time')) return 'Part-time';
    if (text.includes('freelance') || text.includes('freelancer')) return 'Freelance';
    if (text.includes('internship') || text.includes('intern')) return 'Internship';
    if (text.includes('full') || text.includes('full-time')) return 'Full-time';

    // Default classification based on common patterns
    return 'Full-time';
}

function extractSalary(text) {
    if (!text) return null;

    // Look for salary patterns like "₦100,000 - ₦200,000" or "$50,000 - $70,000"
    const salaryPatterns = [
        /₦[\d,]+(?:\s*-\s*₦[\d,]+)?(?:\s*per\s*(?:year|month|hour|week))?/i,
        /\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*per\s*(?:year|month|hour|week))?/i,
        /£[\d,]+(?:\s*-\s*£[\d,]+)?(?:\s*per\s*(?:year|month|hour|week))?/i,
        /€[\d,]+(?:\s*-\s*€[\d,]+)?(?:\s*per\s*(?:year|month|hour|week))?/i
    ];

    for (const pattern of salaryPatterns) {
        const match = text.match(pattern);
        if (match) return match[0].trim();
    }

    return null;
}

function validateJobURL(jobURL, source) {
    if (!jobURL || jobURL === 'N/A') return false;

    const url = jobURL.toLowerCase();
    switch (source) {
        case 'Indeed':
            return url.includes('indeed.com');
        case 'LinkedIn':
            return url.includes('linkedin.com');
        case 'Jobberman':
            return url.includes('jobberman.com');
        default:
            return true; // Allow unknown sources
    }
}

async function createBrowser() {
    return await puppeteerExtra.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || require("puppeteer").executablePath(),
        protocolTimeout: 120000
    });
}

async function scrapeIndeed(page, keyword, location) {
    const IndeedUrl = `https://ng.indeed.com/jobs?q=${keyword}&l=${location}`;

    try {
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setRequestInterception(true);

        page.on('request', (req) => {
            if (['stylesheet', 'font', 'image'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        console.log(`Navigating to Indeed URL: ${IndeedUrl}`);
        await page.goto(IndeedUrl, { waitUntil: "domcontentloaded", timeout: 60000 }); // 60s timeout

        const jobs = await page.evaluate(() => {
            const selectors = ['.job_seen_beacon', '.jobsearch-ResultsList li', '[data-jk]']; // Fallback selectors
            let elements = [];
            for (const selector of selectors) {
                elements = document.querySelectorAll(selector);
                if (elements.length > 0) break;
            }
            return Array.from(elements, (e) => ({
                title: e.querySelector('h2 a span[title], .jobTitle, a')?.innerText || 'N/A',
                companyName: e.querySelector('.companyName, .company')?.innerText || 'N/A',
                jobLocation: e.querySelector('.companyLocation, .location')?.innerText || 'N/A',
                jobDuration: e.querySelector('time, .date')?.innerText || 'N/A',
                jobURL: e.querySelector('h2 a, a')?.href ? new URL(e.querySelector('h2 a, a').href, window.location.origin).href : 'N/A',
                salary: e.querySelector('.salary-snippet, .salary')?.innerText || null,
            }));
        });

        console.log(`${jobs.length} jobs extracted from Indeed for ${keyword} in ${location}`);
        if (jobs.length === 0) {
            console.warn(`No jobs found on Indeed page - selectors may be outdated`);
        }

        // Process jobs in chunks to reduce memory usage
        const BATCH_SIZE = 50;
        let totalSaved = 0;

        for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
            const batch = jobs.slice(i, i + BATCH_SIZE);
            const validJobs = [];

            for (const job of batch) {
                // Skip jobs with missing critical data
                if (job.title === 'N/A' || job.jobURL === 'N/A') {
                    if (process.env.NODE_ENV === 'development') {
                        console.log(`Skipping job with missing title or URL from Indeed`);
                    }
                    continue;
                }

                job.keyword = keyword;
                job.location = location;
                job.source = 'Indeed';
                job.jobType = classifyJobType(job.jobDuration, job.title, job.jobLocation);
                job.salary = extractSalary(job.salary) || extractSalary(job.title + ' ' + (job.jobDuration || ''));

                // Validate job URL matches the source platform
                if (!validateJobURL(job.jobURL, job.source)) {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn(`Skipping job with invalid URL for ${job.source}: ${job.jobURL}`);
                    }
                    continue;
                }

                // Normalize fields
                job.title = job.title.trim().toLowerCase();
                job.companyName = job.companyName.trim().toLowerCase();
                job.jobLocation = job.jobLocation.trim().toLowerCase();

                validJobs.push(job);
            }

            // Batch database operations
            if (validJobs.length > 0) {
                const jobOperations = validJobs.map(job => ({
                    updateOne: {
                        filter: { jobURL: job.jobURL },
                        update: {
                            ...job,
                            scrapedAt: new Date()
                        },
                        upsert: true
                    }
                }));

                const result = await Job.bulkWrite(jobOperations);
                const savedCount = result.upsertedCount + result.modifiedCount;
                totalSaved += savedCount;

                if (process.env.NODE_ENV === 'development') {
                    console.log(`${savedCount} ${keyword} jobs saved from Indeed batch (inserted: ${result.upsertedCount}, updated: ${result.modifiedCount})`);
                }
            }
        }

        if (process.env.NODE_ENV !== 'development') {
            console.log(`${totalSaved} ${keyword} jobs saved from Indeed`);
        }
        return jobs;
    } catch (error) {
        console.error(`Error scraping Indeed for ${keyword} in ${location}:`, error.message);
        return [];
    }
}

async function scrapeLinkedIn(page, keyword, location) {
    const linkedinUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${keyword}&location=${location}`;

    try {
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setRequestInterception(true);

        page.on('request', (req) => {
            if (['stylesheet', 'font', 'image'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        console.log(`Navigating to LinkedIn URL: ${linkedinUrl}`);
        await page.goto(linkedinUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

        const jobs = await page.evaluate(() => {
            const selectors = ['li', '.job-search-card', '.base-search-card']; // Fallback selectors
            let elements = [];
            for (const selector of selectors) {
                elements = document.querySelectorAll(selector);
                if (elements.length > 0) break;
            }
            return Array.from(elements, (e) => ({
                title: e.querySelector('.base-search-card__title, .job-title, h3')?.innerText || 'N/A',
                companyName: e.querySelector('.base-search-card__subtitle a, .company-name')?.innerText || 'N/A',
                companyURL: e.querySelector('.base-search-card__subtitle a')?.href || 'N/A',
                jobLocation: e.querySelector('.job-search-card__location, .location')?.innerText || 'N/A',
                jobDuration: e.querySelector('time, [data-testid=myJobsStateDate], .job-search-card__time')?.innerText || 'N/A',
                jobURL: e.querySelector('a.base-card__full-link, a')?.href || 'N/A',
                salary: e.querySelector('.job-search-card__salary-info, .salary')?.innerText || null,
            }));
        });

        console.log(`${jobs.length} jobs extracted from LinkedIn for ${keyword} in ${location}`);
        if (jobs.length === 0) {
            console.warn(`No jobs found on LinkedIn page - selectors may be outdated`);
        }

        // Process jobs in chunks to reduce memory usage
        const BATCH_SIZE = 50;
        let totalSaved = 0;

        for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
            const batch = jobs.slice(i, i + BATCH_SIZE);
            const validJobs = [];

            for (const job of batch) {
                // Skip jobs with missing critical data
                if (job.title === 'N/A' || job.jobURL === 'N/A') {
                    if (process.env.NODE_ENV === 'development') {
                        console.log(`Skipping job with missing title or URL from LinkedIn`);
                    }
                    continue;
                }

                job.keyword = keyword;
                job.location = location;
                job.source = 'LinkedIn';
                job.jobType = classifyJobType(job.jobDuration, job.title, job.jobLocation);
                job.salary = extractSalary(job.salary) || extractSalary(job.title + ' ' + (job.jobDuration || ''));

                // Validate job URL matches the source platform
                if (!validateJobURL(job.jobURL, job.source)) {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn(`Skipping job with invalid URL for ${job.source}: ${job.jobURL}`);
                    }
                    continue;
                }

                // Normalize fields
                job.title = job.title.trim().toLowerCase();
                job.companyName = job.companyName.trim().toLowerCase();
                job.jobLocation = job.jobLocation.trim().toLowerCase();

                validJobs.push(job);
            }

            // Batch database operations
            if (validJobs.length > 0) {
                const jobOperations = validJobs.map(job => ({
                    updateOne: {
                        filter: { jobURL: job.jobURL },
                        update: {
                            ...job,
                            scrapedAt: new Date()
                        },
                        upsert: true
                    }
                }));

                const result = await Job.bulkWrite(jobOperations);
                const savedCount = result.upsertedCount + result.modifiedCount;
                totalSaved += savedCount;

                if (process.env.NODE_ENV === 'development') {
                    console.log(`${savedCount} ${keyword} jobs saved from LinkedIn batch (inserted: ${result.upsertedCount}, updated: ${result.modifiedCount})`);
                }
            }
        }

        if (process.env.NODE_ENV !== 'development') {
            console.log(`${totalSaved} ${keyword} jobs saved from LinkedIn`);
        }
        return jobs;
    } catch (error) {
        console.error(`Error scraping LinkedIn for ${keyword} in ${location}:`, error.message);
        return [];
    }
}

async function scrapeJobberman(page, keyword, location) {
    const jobbermanUrl = `https://www.jobberman.com/jobs?q=${keyword}&l=${location}`;

    try {
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setRequestInterception(true);

        page.on('request', (req) => {
            if (['stylesheet', 'font', 'image'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        console.log(`Navigating to Jobberman URL: ${jobbermanUrl}`);
        await page.goto(jobbermanUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

        const jobs = await page.evaluate(() => {
            const selectors = ['[data-cy=listing-cards-components]', '.job-card', '.listing-card']; // Fallback selectors
            let elements = [];
            for (const selector of selectors) {
                elements = document.querySelectorAll(selector);
                if (elements.length > 0) break;
            }
            return Array.from(elements, (e) => ({
                title: e.querySelector('[data-cy=listing-title-link], .job-title, a')?.innerText || 'N/A',
                companyName: e.querySelector('.text-loading-animate-link, .company-name')?.innerText || 'N/A',
                companyURL: e.querySelector('.text-loading-animate-link, a')?.href || 'N/A',
                jobLocation: e.querySelector('.text-loading-hide, .location')?.innerText || 'N/A',
                jobDuration: e.querySelector('p .text-loading-animate, [data-cy=job-date], .job-date')?.innerText || 'N/A',
                jobURL: e.querySelector('[data-cy=listing-title-link], a')?.href || 'N/A',
                salary: e.querySelector('[data-cy=salary-range], .salary')?.innerText || null,
            }));
        });

        console.log(`${jobs.length} jobs extracted from Jobberman for ${keyword} in ${location}`);
        if (jobs.length === 0) {
            console.warn(`No jobs found on Jobberman page - selectors may be outdated`);
        }

        // Process jobs in chunks to reduce memory usage
        const BATCH_SIZE = 50;
        let totalSaved = 0;

        for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
            const batch = jobs.slice(i, i + BATCH_SIZE);
            const validJobs = [];

            for (const job of batch) {
                // Skip jobs with missing critical data
                if (job.title === 'N/A' || job.jobURL === 'N/A') {
                    if (process.env.NODE_ENV === 'development') {
                        console.log(`Skipping job with missing title or URL from Jobberman`);
                    }
                    continue;
                }

                job.keyword = keyword;
                job.location = location;
                job.source = 'Jobberman';
                job.jobType = classifyJobType(job.jobDuration, job.title, job.jobLocation);
                job.salary = extractSalary(job.salary) || extractSalary(job.title + ' ' + (job.jobDuration || ''));

                // Validate job URL matches the source platform
                if (!validateJobURL(job.jobURL, job.source)) {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn(`Skipping job with invalid URL for ${job.source}: ${job.jobURL}`);
                    }
                    continue;
                }

                // Normalize fields
                job.title = job.title.trim().toLowerCase();
                job.companyName = job.companyName.trim().toLowerCase();
                job.jobLocation = job.jobLocation.trim().toLowerCase();

                validJobs.push(job);
            }

            // Batch database operations
            if (validJobs.length > 0) {
                const jobOperations = validJobs.map(job => ({
                    updateOne: {
                        filter: { jobURL: job.jobURL },
                        update: {
                            ...job,
                            scrapedAt: new Date()
                        },
                        upsert: true
                    }
                }));

                const result = await Job.bulkWrite(jobOperations);
                const savedCount = result.upsertedCount + result.modifiedCount;
                totalSaved += savedCount;

                if (process.env.NODE_ENV === 'development') {
                    console.log(`${savedCount} ${keyword} jobs saved from Jobberman batch (inserted: ${result.upsertedCount}, updated: ${result.modifiedCount})`);
                }
            }
        }

        if (process.env.NODE_ENV !== 'development') {
            console.log(`${totalSaved} ${keyword} jobs saved from Jobberman`);
        }
        return jobs;
    } catch (error) {
        console.error(`Error scraping Jobberman for ${keyword} in ${location}:`, error.message);
        return [];
    }
}

async function scrapeAllPlatforms(keyword, location) {
    const browser = await createBrowser();
    try {
        const pageIndeed = await browser.newPage();
        const pageLinkedIn = await browser.newPage();
        const pageJobberman = await browser.newPage();

        // Add delays between requests to avoid rate limiting
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Locations that work well with Indeed (geographic)
        const indeedValidLocations = ['nigeria', 'abuja', 'lagos'];

        // Scrape platforms sequentially with delays to avoid overwhelming servers
        console.log(`Starting scrape for ${keyword} in ${location}`);

        let indeedJobs = [];
        if (indeedValidLocations.includes(location.toLowerCase())) {
            indeedJobs = await scrapeIndeed(pageIndeed, keyword, location);
        } else {
            console.log(`Skipping Indeed for non-geographic location: ${location}`);
        }
        await delay(2000); // 2 second delay

        const linkedInJobs = await scrapeLinkedIn(pageLinkedIn, keyword, location);
        await delay(2000); // 2 second delay

        const jobbermanJobs = await scrapeJobberman(pageJobberman, keyword, location);

        const totalJobs = indeedJobs.length + linkedInJobs.length + jobbermanJobs.length;
        console.log(`Completed scraping ${totalJobs} jobs for ${keyword} in ${location}`);

        return [...indeedJobs, ...linkedInJobs, ...jobbermanJobs];
    } catch (error) {
        console.error('Error scraping all platforms:', error);
        throw new Error('Error scraping all platforms: ' + error.message);
    } finally {
        await browser.close();
    }
}

module.exports = {
    scrapeIndeed,
    scrapeLinkedIn,
    scrapeJobberman,
    scrapeAllPlatforms,
};
