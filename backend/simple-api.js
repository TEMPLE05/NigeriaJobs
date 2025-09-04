const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Mock data
const mockJobs = [
  {
    _id: '1',
    title: 'Software Developer',
    company: 'TechCorp Nigeria',
    location: 'Lagos',
    description: 'We are looking for a skilled software developer with experience in React and Node.js...',
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
    description: 'Exciting opportunity for a marketing professional with digital marketing experience...',
    salary: '₦120,000 - ₦180,000',
    jobType: 'Full-time',
    category: 'Marketing',
    applicationUrl: 'https://example.com/apply',
    datePosted: new Date().toISOString(),
    isActive: true
  },
  {
    _id: '3',
    title: 'Data Analyst',
    company: 'FinanceHub Nigeria',
    location: 'Lagos',
    description: 'Join our team as a data analyst working with financial data and business intelligence...',
    salary: '₦130,000 - ₦200,000',
    jobType: 'Full-time',
    category: 'Finance',
    applicationUrl: 'https://example.com/apply',
    datePosted: new Date().toISOString(),
    isActive: true
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Job Aggregator API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/jobs', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const jobs = mockJobs.slice(skip, skip + limit);

  res.json({
    jobs,
    totalPages: Math.ceil(mockJobs.length / limit),
    currentPage: page,
    total: mockJobs.length
  });
});

app.get('/api/jobs/stats/overview', (req, res) => {
  res.json({
    totalJobs: mockJobs.length,
    totalCompanies: 3,
    topCategories: [
      { _id: 'Technology', count: 1 },
      { _id: 'Marketing', count: 1 },
      { _id: 'Finance', count: 1 }
    ],
    topLocations: [
      { _id: 'Lagos', count: 2 },
      { _id: 'Abuja', count: 1 }
    ]
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, profile } = req.body;

  if (!email || !password || !profile) {
    return res.status(400).json({
      error: 'Missing required fields',
      code: 'VALIDATION_ERROR'
    });
  }

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: 'mock-user-id',
      email,
      profile
    },
    token: 'mock-jwt-token'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required',
      code: 'VALIDATION_ERROR'
    });
  }

  res.json({
    message: 'Login successful',
    user: {
      id: 'mock-user-id',
      email,
      profile: { firstName: 'John', lastName: 'Doe' }
    },
    token: 'mock-jwt-token'
  });
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
  console.log(`🌐 Frontend URL: http://localhost:3000`);
  console.log(`📊 Mock data mode: ${mockJobs.length} jobs available`);
});