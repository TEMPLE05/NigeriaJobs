const jobbermanScraper = require('./jobberman');
const myJobMagScraper = require('./myjobmag');
const hotNigerianJobsScraper = require('./hotnigerianjobs');

const scrapers = [
  { name: 'Jobberman', scraper: jobbermanScraper },
  { name: 'MyJobMag', scraper: myJobMagScraper },
  { name: 'Hot Nigerian Jobs', scraper: hotNigerianJobsScraper }
];

async function runAllScrapers() {
  const results = {
    totalJobsScraped: 0,
    details: []
  };

  for (const { name, scraper } of scrapers) {
    try {
      console.log(`Starting scraping for ${name}...`);
      const scraperResult = await scraper.scrape();
      results.totalJobsScraped += scraperResult.jobsScraped;
      results.details.push({
        source: name,
        jobsScraped: scraperResult.jobsScraped,
        success: true
      });
      console.log(`${name}: ${scraperResult.jobsScraped} jobs scraped`);
    } catch (error) {
      console.error(`Error scraping ${name}:`, error);
      results.details.push({
        source: name,
        jobsScraped: 0,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

module.exports = {
  runAllScrapers
};