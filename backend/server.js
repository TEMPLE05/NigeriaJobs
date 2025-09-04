const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import models (optional - will work without them)
let Job, User;
try {
  Job = require('./models/Job');
} catch (error) {
  console.log('Job model not available, using mock data');
  Job = null;
}

try {
  User = require('./models/User');
} catch (error) {
  console.log('User model not available, using mock data');
  User = null;
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB (optional - will work without it for basic functionality)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-aggregator', {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000
}).catch(err => {
  console.log('MongoDB not available, running in offline mode');
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Job Aggregator API is running',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Jobs routes
app.get('/api/jobs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // For now, return mock data if MongoDB is not connected
    if (mongoose.connection.readyState !== 1) {
      const mockJobs = [
        {
          _id: '1',
          title: 'Software Developer',
          company: 'TechCorp Nigeria',
          location: 'Lagos',
          description: 'We are looking for a skilled software developer...',
          salary: '₦150,000 - ₦250,000',
          jobType: 'Full-time',
          category: 'Technology',
          applicationUrl: 'https://example.com/apply',
          datePosted: new Date().toISOString(),
          isActive: true
        },
        {
          _id: '2',
          title: 'Marketing Manager',
          company: 'Global Solutions Ltd',
          location: 'Abuja',
          description: 'Exciting opportunity for a marketing professional...',
          salary: '₦120,000 - ₦180,000',
          jobType: 'Full-time',
          category: 'Marketing',
          applicationUrl: 'https://example.com/apply',
          datePosted: new Date().toISOString(),
          isActive: true
        }
      ];

      res.json({
        jobs: mockJobs.slice(skip, skip + limit),
        totalPages: Math.ceil(mockJobs.length / limit),
        currentPage: page,
        total: mockJobs.length
      });
      return;
    }

    const jobs = await Job.find({ status: 'active' })
      .sort({ datePosted: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments({ status: 'active' });

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.get('/api/jobs/stats/overview', async (req, res) => {
  try {
    // Return mock stats if MongoDB is not connected
    if (mongoose.connection.readyState !== 1) {
      res.json({
        totalJobs: 150,
        totalCompanies: 45,
        topCategories: [
          { _id: 'Technology', count: 35 },
          { _id: 'Marketing', count: 28 },
          { _id: 'Finance', count: 22 }
        ],
        topLocations: [
          { _id: 'Lagos', count: 67 },
          { _id: 'Abuja', count: 43 },
          { _id: 'Port Harcourt', count: 25 }
        ]
      });
      return;
    }

    const stats = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          categories: { $addToSet: '$category.primary' },
          locations: { $addToSet: '$location.city' }
        }
      }
    ]);

    if (stats.length === 0) {
      res.json({
        totalJobs: 0,
        totalCompanies: 0,
        topCategories: [],
        topLocations: []
      });
      return;
    }

    res.json({
      totalJobs: stats[0].totalJobs,
      totalCompanies: stats[0].categories.length,
      topCategories: stats[0].categories.slice(0, 10).map(cat => ({ _id: cat, count: 1 })),
      topLocations: stats[0].locations.slice(0, 10).map(loc => ({ _id: loc, count: 1 }))
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Auth routes (basic implementation)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, profile } = req.body;

    if (!email || !password || !profile) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'VALIDATION_ERROR'
      });
    }

    // Mock registration for now
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: 'mock-user-id',
        email,
        profile
      },
      token: 'mock-jwt-token'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Registration failed',
      code: 'REGISTRATION_ERROR'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'VALIDATION_ERROR'
      });
    }

    // Mock login for now
    res.json({
      message: 'Login successful',
      user: {
        id: 'mock-user-id',
        email,
        profile: { firstName: 'John', lastName: 'Doe' }
      },
      token: 'mock-jwt-token'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Job Aggregator API running on port ${PORT}`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected (using mock data)'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});