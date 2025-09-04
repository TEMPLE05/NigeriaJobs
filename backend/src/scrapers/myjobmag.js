const BaseScraper = require('./BaseScraper');

class MyJobMagScraper extends BaseScraper {
  constructor() {
    super('MyJobMag');
    this.baseUrl = 'https://www.myjobmag.com';
    this.searchUrl = 'https://www.myjobmag.com/jobs';
  }

  async scrape(pages = 3) {
    const jobs = [];

    try {
      await this.initBrowser();

      for (let page = 1; page <= pages; page++) {
        console.log(`Scraping MyJobMag page ${page}...`);

        const url = page === 1 ? this.searchUrl : `${this.searchUrl}?page=${page}`;
        const $ = await this.scrapeWithPuppeteer(url, { timeout: 60000 });

        if (!$) continue;

        // Adjust selectors based on actual MyJobMag structure
        $('.job-card, .job-item, .job-listing').each((index, element) => {
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
      console.error('MyJobMag scraping error:', error.message);
      await this.closeBrowser();
    }

    return jobs;
  }

  extractJobData($, element) {
    // Adjust these selectors based on actual MyJobMag HTML structure
    return {
      title: element.find('h3, .job-title').first().text(),
      company: element.find('.company, .employer').first().text(),
      location: element.find('.location, .job-location').first().text(),
      description: element.find('.description, .job-description').first().text(),
      category: this.extractCategory(element.find('.description, .job-description').first().text() || element.find('h3, .job-title').first().text()),
      applicationUrl: element.find('a').first().attr('href'),
      salary: element.find('.salary, .compensation').first().text(),
      jobType: this.extractJobType(element.find('.description, .job-description').first().text() || element.find('h3, .job-title').first().text())
    };
  }

  extractJobType(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('remote')) return 'Remote';
    if (lowerText.includes('contract')) return 'Contract';
    if (lowerText.includes('part-time') || lowerText.includes('part time')) return 'Part-time';
    if (lowerText.includes('internship') || lowerText.includes('intern')) return 'Internship';
    return 'Full-time';
  }

  extractCategory(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('software') || lowerText.includes('developer') || lowerText.includes('engineer')) return 'Technology';
    if (lowerText.includes('marketing') || lowerText.includes('sales')) return 'Marketing';
    if (lowerText.includes('finance') || lowerText.includes('accounting')) return 'Finance';
    if (lowerText.includes('hr') || lowerText.includes('human resource')) return 'Human Resources';
    return 'General';
  }
}

module.exports = MyJobMagScraper;