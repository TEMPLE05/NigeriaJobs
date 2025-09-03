const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const dotenv = require('dotenv');

const jobRoutes = require('./routes/jobs');
const scraperRoutes = require('./routes/scraper');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-aggregator', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/scraper', scraperRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Job Aggregator API is running' });
});

// Scheduled scraping (runs every 6 hours)
cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled scraping...');
  try {
    const scraper = require('./scrapers');
    await scraper.runAllScrapers();
    console.log('Scheduled scraping completed');
  } catch (error) {
    console.error('Scheduled scraping failed:', error);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});