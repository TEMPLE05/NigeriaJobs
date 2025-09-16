const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const compression = require('compression');
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

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Database Connection Successful');
    })
    .catch((e) => {
        console.error('Error connecting to MongoDB:', e.message);
    });

const keywords = ['developer', 'engineer', 'software', 'frontend', 'fullstack', 'backend', 'data', 'scientist', 'designer']; 
const locations = ['nigeria','remote','abuja','lagos','fulltime','parttime','onsite','hybrid']; 

// 🔹 Manual scrape endpoint (so you don’t wait for cron)
app.get('/api/scrape', async (req, res) => {
    try {
        for (const keyword of keywords) {
            for (const location of locations) {
                await scrapeAllPlatforms(keyword, location);
                console.log(`Scraped data for ${keyword} in ${location}`);
            }
        }
        res.json({ message: "Scraping completed successfully!" });
    } catch (error) {
        console.error("Manual scrape failed:", error);
        res.status(500).json({ error: "Scraping failed" });
    }
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

    let { keyword, location, page = 1, limit = 10 } = req.query;

    keyword = keyword || '';
    location = location || '';
    page = parseInt(page);
    limit = parseInt(limit);

    try {
        let jobs;
        let totalJobs;

        const query = {};
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

        // Get total count for pagination
        totalJobs = await Job.countDocuments(query);

        // Get paginated results
        const skip = (page - 1) * limit;
        jobs = await Job.find(query).sort({ scrapedAt: -1 }).skip(skip).limit(limit);
        console.log(`Found ${jobs.length} jobs with initial search (page ${page}, limit ${limit})`);

        if (jobs.length > 0) {
            console.log(`Sample job titles:`, jobs.slice(0, 3).map(job => job.title));
        }

        if (jobs.length === 0 && keyword) {
            console.log(`No jobs found with initial search, trying fallback search...`);
            const fallbackQuery = {
                title: { $regex: new RegExp(keyword, 'i') }
            };

            totalJobs = await Job.countDocuments(fallbackQuery);
            const similarJobs = await Job.find(fallbackQuery).sort({ scrapedAt: -1 }).skip(skip).limit(limit);

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

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
    console.log('Scheduling cron job');
});
