const express = require('express');
const Job = require('../models/Job');

const router = express.Router();

// GET /api/jobs - Get all jobs with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      location,
      category,
      jobType,
      search,
      company,
      dateRange
    } = req.query;

    const query = { isActive: true };

    // Add filters
    if (location && location !== '') query.location = new RegExp(location, 'i');
    if (category && category !== '') query.category = new RegExp(category, 'i');
    if (jobType && jobType !== '') query.jobType = jobType;
    if (company && company !== '') query.company = new RegExp(company, 'i');

    // Add date range filter
    if (dateRange && dateRange !== '') {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case '1day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          break;
      }

      if (startDate) {
        query.datePosted = { $gte: startDate };
      }
    }

    // Add search functionality
    if (search && search.trim()) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const jobs = await Job.find(query)
      .sort({ datePosted: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    const total = await Job.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      jobs,
      totalPages,
      currentPage: pageNum,
      total
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/stats/overview - Get job statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ isActive: true });

    const totalCompanies = await Job.distinct('company', { isActive: true });
    const totalCompaniesCount = totalCompanies.length;

    const topCategories = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const topLocations = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalJobs,
      totalCompanies: totalCompaniesCount,
      topCategories,
      topLocations
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/jobs/:id - Get single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

module.exports = router;