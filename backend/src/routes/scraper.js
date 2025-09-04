const express = require('express');
const ScrapingController = require('../scrapers/ScrapingController');

const router = express.Router();

// POST /api/scraper/run - Trigger manual scraping
router.post('/run', async (req, res) => {
  try {
    console.log('Starting manual scraping...');

    const scrapingController = new ScrapingController();
    const jobsScraped = await scrapingController.runAllScrapers();

    res.json({
      message: 'Scraping completed successfully',
      jobsScraped
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