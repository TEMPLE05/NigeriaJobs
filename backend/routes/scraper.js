const express = require('express');
const scraper = require('../scrapers');

const router = express.Router();

// POST /api/scraper/run - Trigger manual scraping
router.post('/run', async (req, res) => {
  try {
    console.log('Starting manual scraping...');

    const result = await scraper.runAllScrapers();

    res.json({
      message: 'Scraping completed successfully',
      jobsScraped: result.totalJobsScraped,
      details: result.details
    });
  } catch (error) {
    console.error('Scraping failed:', error);
    res.status(500).json({
      error: 'Scraping failed',
      message: error.message
    });
  }
});

module.exports = router;