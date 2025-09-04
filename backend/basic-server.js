const http = require('http');
const url = require('url');

// Mock data
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

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  const method = req.method;

  console.log(`${method} ${req.url}`);

  // Health check
  if (pathname === '/api/health' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'OK',
      message: 'Basic Job Aggregator API is running',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Jobs endpoint
  if (pathname.startsWith('/api/jobs') && method === 'GET') {
    if (pathname === '/api/jobs') {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 20;
      const skip = (page - 1) * limit;
      const jobs = mockJobs.slice(skip, skip + limit);

      res.writeHead(200);
      res.end(JSON.stringify({
        jobs,
        totalPages: Math.ceil(mockJobs.length / limit),
        currentPage: page,
        total: mockJobs.length
      }));
      return;
    }

    if (pathname === '/api/jobs/stats/overview') {
      res.writeHead(200);
      res.end(JSON.stringify({
        totalJobs: mockJobs.length,
        totalCompanies: 2,
        topCategories: [
          { _id: 'Technology', count: 1 },
          { _id: 'Marketing', count: 1 }
        ],
        topLocations: [
          { _id: 'Lagos', count: 1 },
          { _id: 'Abuja', count: 1 }
        ]
      }));
      return;
    }
  }

  // Auth endpoints
  if (pathname === '/api/auth/login' && method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: 'Login successful',
      user: {
        id: 'mock-user-id',
        email: 'user@example.com',
        profile: { firstName: 'John', lastName: 'Doe' }
      },
      token: 'mock-jwt-token'
    }));
    return;
  }

  if (pathname === '/api/auth/register' && method === 'POST') {
    res.writeHead(201);
    res.end(JSON.stringify({
      message: 'User registered successfully',
      user: {
        id: 'mock-user-id',
        email: 'user@example.com',
        profile: { firstName: 'John', lastName: 'Doe' }
      },
      token: 'mock-jwt-token'
    }));
    return;
  }

  // 404 for unknown routes
  res.writeHead(404);
  res.end(JSON.stringify({
    error: 'Route not found',
    code: 'NOT_FOUND',
    path: req.url,
    method: method
  }));
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Basic Job Aggregator API running on port ${PORT}`);
  console.log(`🌐 Frontend URL: http://localhost:3000`);
  console.log(`📊 Mock data mode: ${mockJobs.length} jobs available`);
  console.log(`🔗 Available endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/jobs`);
  console.log(`   GET  /api/jobs/stats/overview`);
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/auth/register`);
});