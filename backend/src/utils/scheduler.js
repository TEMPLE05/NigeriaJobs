const cron = require('node-cron');
const ScrapingController = require('../scrapers/ScrapingController');

const scrapingController = new ScrapingController();

// Schedule scraping every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Starting scheduled job scraping...');
  try {
    await scrapingController.runAllScrapers();
    await scrapingController.cleanOldJobs();
  } catch (error) {
    console.error('Scheduled scraping error:', error);
  }
});

// Schedule cleanup every week
cron.schedule('0 3 * * 0', async () => {
  console.log('Running weekly cleanup...');
  await scrapingController.cleanOldJobs();
});

console.log('Job scraping scheduler initialized');