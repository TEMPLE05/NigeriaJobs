const Job = require('../models/Job');
const JobbermanScraper = require('./jobberman');
const MyJobMagScraper = require('./myjobmag');
const HotNigerianJobsScraper = require('./hotnigerianjobs');

class ScrapingController {
  constructor() {
    this.scrapers = [
      new JobbermanScraper(),
      new MyJobMagScraper(),
      new HotNigerianJobsScraper()
    ];
  }

  async runAllScrapers() {
    console.log('Starting job scraping...');
    let totalJobs = 0;

    for (const scraper of this.scrapers) {
      try {
        console.log(`Running ${scraper.name} scraper...`);
        const jobs = await scraper.scrape();

        if (jobs.length > 0) {
          const savedJobs = await this.saveJobs(jobs);
          console.log(`${scraper.name}: Scraped ${jobs.length} jobs, saved ${savedJobs} new jobs`);
          totalJobs += savedJobs;
        }

        // Browser is already closed in scraper.scrape()
      } catch (error) {
        console.error(`Error with ${scraper.name}:`, error.message);
      }
    }

    console.log(`Scraping completed. Total new jobs: ${totalJobs}`);
    return totalJobs;
  }

  async saveJobs(jobs) {
    let savedCount = 0;

    for (const jobData of jobs) {
      try {
        // Check if job already exists
        const existingJob = await Job.findOne({
          title: jobData.title,
          company: jobData.company,
          applicationUrl: jobData.applicationUrl
        });

        if (!existingJob) {
          await Job.create(jobData);
          savedCount++;
        }
      } catch (error) {
        console.error('Error saving job:', error.message);
      }
    }

    return savedCount;
  }

  async cleanOldJobs() {
    // Remove jobs older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Job.updateMany(
      { datePosted: { $lt: thirtyDaysAgo } },
      { isActive: false }
    );
    console.log(`Deactivated ${result.modifiedCount} old jobs`);
  }
}

module.exports = ScrapingController;