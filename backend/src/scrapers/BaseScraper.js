const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

class BaseScraper {
  constructor(name) {
    this.name = name;
    this.browser = null;
  }

  async initBrowser() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async scrapeWithCheerio(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      return cheerio.load(response.data);
    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      return null;
    }
  }

  async scrapeWithPuppeteer(url, options = {}) {
    try {
      if (!this.browser) await this.initBrowser();
      const page = await this.browser.newPage();

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: options.timeout || 30000,
        ...options
      });

      const content = await page.content();
      await page.close();

      return cheerio.load(content);
    } catch (error) {
      console.error(`Error scraping ${url} with Puppeteer:`, error.message);
      return null;
    }
  }

  // Override this method in specific scrapers
  async scrape() {
    throw new Error('Scrape method must be implemented by subclass');
  }

  // Clean and normalize job data
  cleanJobData(job) {
    return {
      title: this.cleanText(job.title),
      company: this.cleanText(job.company),
      location: this.cleanText(job.location),
      description: this.cleanText(job.description),
      salary: job.salary || 'Not specified',
      jobType: job.jobType || 'Full-time',
      category: this.cleanText(job.category),
      applicationUrl: job.applicationUrl,
      source: this.name,
      datePosted: job.datePosted || new Date()
    };
  }

  cleanText(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
  }
}

module.exports = BaseScraper;