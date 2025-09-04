const JobbermanScraper = require('./jobberman');
const MyJobMagScraper = require('./myjobmag');
const HotNigerianJobsScraper = require('./hotnigerianjobs');

const scrapers = [
  { name: 'Jobberman', scraper: new JobbermanScraper() },
  { name: 'MyJobMag', scraper: new MyJobMagScraper() },
  { name: 'Hot Nigerian Jobs', scraper: new HotNigerianJobsScraper() }
];

async function runAllScrapers() {
  const results = {
    totalJobsScraped: 0,
    details: []
  };

  for (const { name, scraper } of scrapers) {
    try {
      console.log(`Starting scraping for ${name}...`);
      const jobs = await scraper.scrape();
      results.totalJobsScraped += jobs.length;
      results.details.push({
        source: name,
        jobsScraped: jobs.length,
        success: true
      });
      console.log(`${name}: ${jobs.length} jobs scraped`);
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