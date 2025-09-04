const BaseScraper = require('./BaseScraper');

class HotNigerianJobsScraper extends BaseScraper {
  constructor() {
    super('Hot Nigerian Jobs');
    this.baseUrl = 'https://hotnigerianjobs.com';
  }

  async scrape(pages = 1) {
    const jobs = [];

    try {
      await this.initBrowser();

      console.log(`Scraping Hot Nigerian Jobs...`);

      const url = this.baseUrl;
      const $ = await this.scrapeWithPuppeteer(url, { timeout: 60000 }); // Increased timeout

      if (!$) return jobs;

      // Adjust selectors based on actual Hot Nigerian Jobs structure
      $('.job-card, .job-item, .job-listing, article').each((index, element) => {
        if (index >= 20) return; // Limit to first 20 jobs

        try {
          const job = this.extractJobData($, $(element));
          if (job && job.title && job.company) {
            jobs.push(this.cleanJobData(job));
          }
        } catch (error) {
          console.error('Error extracting job:', error.message);
        }
      });

      await this.closeBrowser();
    } catch (error) {
      console.error('Hot Nigerian Jobs scraping error:', error.message);
      await this.closeBrowser();
    }

    return jobs;
  }

  extractJobData($, element) {
    // Adjust these selectors based on actual Hot Nigerian Jobs HTML structure
    return {
      title: element.find('h2, h3, .job-title, .title').first().text(),
      company: element.find('.company, .employer, .organization').first().text(),
      location: element.find('.location, .job-location, .place').first().text(),
      description: element.find('.description, .job-description, .content, p').first().text(),
      category: this.extractCategory(element.find('.description, .job-description, .content, p').first().text() || element.find('h2, h3, .job-title, .title').first().text()),
      applicationUrl: element.find('a').first().attr('href'),
      salary: element.find('.salary, .compensation, .pay').first().text(),
      jobType: this.extractJobType(element.find('.description, .job-description, .content, p').first().text() || element.find('h2, h3, .job-title, .title').first().text())
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

module.exports = HotNigerianJobsScraper;