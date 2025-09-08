const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
require('dotenv').config();
const { scrapeAllPlatforms } = require('./crawler'); 
const Job = require('./model/job'); 

const app = express();
const PORT = 4000;

app.use(cors());

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

// Cron Function for scraping jobs daily
cron.schedule('0 0 * * *', async () => {
    console.log('Daily scraping cron job started');
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
    console.log('Daily scraping cron job completed');
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
    let { keyword, location } = req.query;

    keyword = keyword || '';
    location = location || '';

    try {
        let jobs;

        const query = {};
        if (keyword) {
            query.title = { $regex: new RegExp(keyword, 'i') };
            console.log(`Searching for keyword: "${keyword}"`);
            console.log(`Search query:`, query);
        }
        if (location) {
            query.jobLocation = { $regex: new RegExp(location, 'i') };
        }

        jobs = await Job.find(query).sort({ scrapedAt: -1 }).limit(20);
        console.log(`Found ${jobs.length} jobs with initial search`);

        if (jobs.length > 0) {
            console.log(`Sample job titles:`, jobs.slice(0, 3).map(job => job.title));
        }

        if (jobs.length === 0 && keyword) {
            console.log(`No jobs found with initial search, trying fallback search...`);
            const similarJobs = await Job.find({
                title: { $regex: new RegExp(keyword, 'i') }
            }).sort({ scrapedAt: -1 }).limit(20);

            console.log(`Fallback search found ${similarJobs.length} jobs`);
            if (similarJobs.length > 0) {
                jobs = similarJobs;
                console.log(`Using fallback results. Sample titles:`, similarJobs.slice(0, 3).map(job => job.title));
            }
        }

        res.json({ jobs });
    } catch (error) {
        console.error('Error fetching job data:', error);
        res.status(500).send('Error fetching job listings');
    }
});

// Debug endpoint to see all job titles
app.get('/api/debug/jobs', async (req, res) => {
    try {
        const allJobs = await Job.find({}, 'title').limit(50);
        const titles = allJobs.map(job => job.title);
        res.json({
            totalJobs: allJobs.length,
            titles: titles,
            hrJobs: titles.filter(title => title.toLowerCase().includes('hr'))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
    console.log('Scheduling cron job');
});
