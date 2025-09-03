const puppeteer = require('puppeteer');
const Job = require('../models/Job');

async function scrape() {
  let browser;
  let jobsScraped = 0;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navigate to Jobberman jobs page
    await page.goto('https://www.jobberman.com/jobs', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait for job listings to load
    await page.waitForSelector('.job-card, .job-listing, [data-testid="job-card"]', { timeout: 30000 });

    // Extract job data
    const jobs = await page.evaluate(() => {
      // Helper functions need to be defined inside evaluate
      function extractJobType(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('remote')) return 'Remote';
        if (lowerText.includes('contract')) return 'Contract';
        if (lowerText.includes('part-time') || lowerText.includes('part time')) return 'Part-time';
        if (lowerText.includes('internship') || lowerText.includes('intern')) return 'Internship';
        return 'Full-time';
      }

      function extractCategory(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('software') || lowerText.includes('developer') || lowerText.includes('engineer')) return 'Technology';
        if (lowerText.includes('marketing') || lowerText.includes('sales')) return 'Marketing';
        if (lowerText.includes('finance') || lowerText.includes('accounting')) return 'Finance';
        if (lowerText.includes('hr') || lowerText.includes('human resource')) return 'Human Resources';
        return 'General';
      }

      function parseDate(dateString) {
        if (!dateString) return new Date();

        const lowerDate = dateString.toLowerCase();
        if (lowerDate.includes('today')) return new Date();
        if (lowerDate.includes('yesterday')) {
          const date = new Date();
          date.setDate(date.getDate() - 1);
          return date;
        }

        // Try to parse relative dates
        const match = lowerDate.match(/(\d+)\s*(day|days|week|weeks|hour|hours|minute|minutes)/);
        if (match) {
          const num = parseInt(match[1]);
          const unit = match[2];
          const date = new Date();

          switch (unit) {
            case 'day':
            case 'days':
              date.setDate(date.getDate() - num);
              break;
            case 'week':
            case 'weeks':
              date.setDate(date.getDate() - (num * 7));
              break;
            case 'hour':
            case 'hours':
              date.setHours(date.getHours() - num);
              break;
            case 'minute':
            case 'minutes':
              date.setMinutes(date.getMinutes() - num);
              break;
          }
          return date;
        }

        return new Date();
      }

      const jobElements = document.querySelectorAll('.job-card, .job-listing, [data-testid="job-card"]');
      const jobData = [];

      jobElements.forEach((element, index) => {
        if (index >= 20) return; // Limit to first 20 jobs

        try {
          const title = element.querySelector('h3, .job-title, [data-testid="job-title"]')?.textContent?.trim();
          const company = element.querySelector('.company-name, .employer, [data-testid="company-name"]')?.textContent?.trim();
          const location = element.querySelector('.location, .job-location, [data-testid="job-location"]')?.textContent?.trim();
          const salary = element.querySelector('.salary, .compensation, [data-testid="salary"]')?.textContent?.trim() || 'Not specified';
          const description = element.querySelector('.description, .job-description, [data-testid="job-description"]')?.textContent?.trim();
          const applicationUrl = element.querySelector('a')?.href;
          const datePosted = element.querySelector('.date, .posted-date, [data-testid="date-posted"]')?.textContent?.trim();

          // Extract job type and category from description or other fields
          const jobType = extractJobType(description || title || '');
          const category = extractCategory(description || title || '');

          if (title && company && location && applicationUrl) {
            jobData.push({
              title,
              company,
              location,
              description: description || `${title} at ${company}`,
              salary,
              jobType,
              category,
              applicationUrl,
              source: 'Jobberman',
              datePosted: parseDate(datePosted),
              scrapedAt: new Date()
            });
          }
        } catch (error) {
          console.error('Error parsing job element:', error);
        }
      });

      return jobData;
    });

    // Save jobs to database
    for (const jobData of jobs) {
      try {
        // Check if job already exists
        const existingJob = await Job.findOne({
          title: jobData.title,
          company: jobData.company,
          source: jobData.source
        });

        if (!existingJob) {
          await Job.create(jobData);
          jobsScraped++;
        }
      } catch (error) {
        console.error('Error saving job:', error);
      }
    }

  } catch (error) {
    console.error('Error scraping Jobberman:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return { jobsScraped };
}

function extractJobType(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('remote')) return 'Remote';
  if (lowerText.includes('contract')) return 'Contract';
  if (lowerText.includes('part-time') || lowerText.includes('part time')) return 'Part-time';
  if (lowerText.includes('internship') || lowerText.includes('intern')) return 'Internship';
  return 'Full-time';
}

function extractCategory(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('software') || lowerText.includes('developer') || lowerText.includes('engineer')) return 'Technology';
  if (lowerText.includes('marketing') || lowerText.includes('sales')) return 'Marketing';
  if (lowerText.includes('finance') || lowerText.includes('accounting')) return 'Finance';
  if (lowerText.includes('hr') || lowerText.includes('human resource')) return 'Human Resources';
  return 'General';
}

function parseDate(dateString) {
  if (!dateString) return new Date();

  const lowerDate = dateString.toLowerCase();
  if (lowerDate.includes('today')) return new Date();
  if (lowerDate.includes('yesterday')) {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  }

  // Try to parse relative dates
  const match = lowerDate.match(/(\d+)\s*(day|days|week|weeks|hour|hours|minute|minutes)/);
  if (match) {
    const num = parseInt(match[1]);
    const unit = match[2];
    const date = new Date();

    switch (unit) {
      case 'day':
      case 'days':
        date.setDate(date.getDate() - num);
        break;
      case 'week':
      case 'weeks':
        date.setDate(date.getDate() - (num * 7));
        break;
      case 'hour':
      case 'hours':
        date.setHours(date.getHours() - num);
        break;
      case 'minute':
      case 'minutes':
        date.setMinutes(date.getMinutes() - num);
        break;
    }
    return date;
  }

  return new Date();
}

module.exports = {
  scrape
};