const puppeteerExtra = require('puppeteer-extra');
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
    return await puppeteerExtra.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'], protocolTimeout: 120000 });
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

        await page.goto(IndeedUrl, { timeout: 120000 });
        const jobs = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.job_seen_beacon'), (e) => ({
                title: e.querySelector('h2 a span[title]')?.innerText || 'N/A',
                companyName: e.querySelector('.companyName')?.innerText || 'N/A',
                jobLocation: e.querySelector('.companyLocation')?.innerText || 'N/A',
                jobDuration: e.querySelector('time')?.innerText || 'N/A',
                jobURL: new URL(e.querySelector('h2 a')?.href || '', window.location.origin).href || 'N/A',
                salary: e.querySelector('.salary-snippet')?.innerText || null,
            }))
        );

        // Save jobs to database with deduplication
        for (const job of jobs) {
            job.keyword = keyword;
            job.location = location;
            job.source = 'Indeed';
            job.jobType = classifyJobType(job.jobDuration, job.title, job.jobLocation);
            job.salary = extractSalary(job.salary) || extractSalary(job.title + ' ' + (job.jobDuration || ''));

            // Validate job URL matches the source platform
            if (!validateJobURL(job.jobURL, job.source)) {
                console.warn(`Skipping job with invalid URL for ${job.source}: ${job.jobURL}`);
                continue;
            }

            // Use upsert to prevent duplicates and update scrapedAt
            await Job.findOneAndUpdate(
                {
                    title: job.title,
                    companyName: job.companyName,
                    jobLocation: job.jobLocation
                },
                {
                    ...job,
                    scrapedAt: new Date() // Always update the scraped date
                },
                {
                    upsert: true,
                    new: true
                }
            );
        }
        const NumberOfJobs = jobs.length;
        console.log(`${NumberOfJobs} ${keyword} jobs scraped from indeed`);
        return jobs;
    } catch (error) {
        console.error("Error scraping Indeed:", error);
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

        await page.goto(linkedinUrl, { timeout: 120000 });
        const jobs = await page.evaluate(() =>
            Array.from(document.querySelectorAll('li'), (e) => ({
                title: e.querySelector('.base-search-card__title')?.innerText || 'N/A',
                companyName: e.querySelector('.base-search-card__subtitle a')?.innerText || 'N/A',
                companyURL: e.querySelector('.base-search-card__subtitle a')?.href || 'N/A',
                jobLocation: e.querySelector('.job-search-card__location')?.innerText || 'N/A',
                jobDuration: e.querySelector('time')?.innerText ||
                           e.querySelector('[data-testid=myJobsStateDate]')?.innerText ||
                           e.querySelector('.job-search-card__time')?.innerText ||
                           'N/A',
                jobURL: e.querySelector('a.base-card__full-link')?.href || 'N/A',
                salary: e.querySelector('.job-search-card__salary-info')?.innerText || null,
            }))
        );

        // Save jobs to database with deduplication
        for (const job of jobs) {
            job.keyword = keyword;
            job.location = location;
            job.source = 'LinkedIn';
            job.jobType = classifyJobType(job.jobDuration, job.title, job.jobLocation);
            job.salary = extractSalary(job.salary) || extractSalary(job.title + ' ' + (job.jobDuration || ''));

            // Validate job URL matches the source platform
            if (!validateJobURL(job.jobURL, job.source)) {
                console.warn(`Skipping job with invalid URL for ${job.source}: ${job.jobURL}`);
                continue;
            }

            // Use upsert to prevent duplicates and update scrapedAt
            await Job.findOneAndUpdate(
                {
                    title: job.title,
                    companyName: job.companyName,
                    jobLocation: job.jobLocation
                },
                {
                    ...job,
                    scrapedAt: new Date() // Always update the scraped date
                },
                {
                    upsert: true,
                    new: true
                }
            );
        }

        const NumberOfJobs = jobs.length;
        console.log(`${NumberOfJobs} ${keyword} jobs scraped from LinkedIn`);
        return jobs;
    } catch (error) {
        console.error("Error scraping LinkedIn:", error);
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

        await page.goto(jobbermanUrl, { timeout: 120000 });
        const jobs = await page.evaluate(() =>
            Array.from(document.querySelectorAll('[data-cy=listing-cards-components]'), (e) => ({
                title: e.querySelector('[data-cy=listing-title-link]')?.innerText || 'N/A',
                companyName: e.querySelector('.text-loading-animate-link')?.innerText || 'N/A',
                companyURL: e.querySelector('.text-loading-animate-link')?.href || 'N/A',
                jobLocation: e.querySelector('.text-loading-hide')?.innerText || 'N/A',
                jobDuration: e.querySelector('p .text-loading-animate')?.innerText ||
                           e.querySelector('[data-cy=job-date]')?.innerText ||
                           e.querySelector('.job-date')?.innerText ||
                           'N/A',
                jobURL: e.querySelector('[data-cy=listing-title-link]')?.href || 'N/A',
                salary: e.querySelector('[data-cy=salary-range]')?.innerText || null,
            }))
        );

        // Save jobs to database with deduplication
        for (const job of jobs) {
            job.keyword = keyword;
            job.location = location;
            job.source = 'Jobberman';
            job.jobType = classifyJobType(job.jobDuration, job.title, job.jobLocation);
            job.salary = extractSalary(job.salary) || extractSalary(job.title + ' ' + (job.jobDuration || ''));

            // Validate job URL matches the source platform
            if (!validateJobURL(job.jobURL, job.source)) {
                console.warn(`Skipping job with invalid URL for ${job.source}: ${job.jobURL}`);
                continue;
            }

            // Use upsert to prevent duplicates and update scrapedAt
            await Job.findOneAndUpdate(
                {
                    title: job.title,
                    companyName: job.companyName,
                    jobLocation: job.jobLocation
                },
                {
                    ...job,
                    scrapedAt: new Date() // Always update the scraped date
                },
                {
                    upsert: true,
                    new: true
                }
            );
        }

        const NumberOfJobs = jobs.length;
        console.log(`${NumberOfJobs} ${keyword} jobs scraped from Jobberman`);
        return jobs;
    } catch (error) {
        console.error("Error scraping Jobberman:", error);
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

        // Scrape platforms sequentially with delays to avoid overwhelming servers
        console.log(`Starting scrape for ${keyword} in ${location}`);

        const indeedJobs = await scrapeIndeed(pageIndeed, keyword, location);
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
