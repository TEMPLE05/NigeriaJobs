const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Initialize scheduler
require('./utils/scheduler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/scraper', require('./routes/scraper'));

// DELETE /api/cleanup - Remove old jobs (older than 7 days)
app.delete('/api/cleanup', async (req, res) => {
  try {
    const Job = require('./models/Job');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const result = await Job.deleteMany({
      datePosted: { $lt: sevenDaysAgo }
    });

    res.json({
      message: `Successfully deleted ${result.deletedCount} old jobs`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up old jobs:', error);
    res.status(500).json({ error: 'Failed to cleanup old jobs' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Job Aggregator API is running' });
});

// Error handling middleware
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;