const BaseScraper = require('./BaseScraper');

class JobbermanScraper extends BaseScraper {
  constructor() {
    super('Jobberman');
    this.baseUrl = 'https://www.jobberman.com';
    this.searchUrl = 'https://www.jobberman.com/jobs';
  }

  async scrape(pages = 3) {
    const jobs = [];

    try {
      await this.initBrowser();

      for (let page = 1; page <= pages; page++) {
        console.log(`Scraping Jobberman page ${page}...`);

        const url = `${this.searchUrl}?page=${page}`;
        const $ = await this.scrapeWithPuppeteer(url, { timeout: 60000 });

        if (!$) continue;

        // Adjust selectors based on actual Jobberman structure
        $('.job-item, .job-card, [data-testid="job-card"]').each((index, element) => {
          try {
            const job = this.extractJobData($, $(element));
            if (job && job.title && job.company) {
              jobs.push(this.cleanJobData(job));
            }
          } catch (error) {
            console.error('Error extracting job:', error.message);
          }
        });

        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      await this.closeBrowser();
    } catch (error) {
      console.error('Jobberman scraping error:', error.message);
      await this.closeBrowser();
    }

    return jobs;
  }

  extractJobData($, element) {
    // Adjust these selectors based on actual Jobberman HTML structure
    return {
      title: element.find('.job-title, h3, h4').first().text(),
      company: element.find('.company-name, .employer').first().text(),
      location: element.find('.job-location, .location').first().text(),
      description: element.find('.job-description, .summary').first().text(),
      category: element.find('.job-category, .sector').first().text(),
      applicationUrl: this.baseUrl + element.find('a').first().attr('href'),
      salary: element.find('.salary, .pay').first().text(),
      jobType: this.extractJobType(element.find('.job-type, .employment-type').first().text())
    };
  }

  extractJobType(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('part-time')) return 'Part-time';
    if (lowerText.includes('contract')) return 'Contract';
    if (lowerText.includes('internship')) return 'Internship';
    if (lowerText.includes('remote')) return 'Remote';
    return 'Full-time';
  }
}

module.exports = JobbermanScraper;