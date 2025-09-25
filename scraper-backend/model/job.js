const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: String,
    companyName: String,
    companyURL: String,
    jobLocation: String,
    jobDuration: String,
    jobURL: String,
    keyword: String,
    location: String,
    source: String,              // NEW: Platform source (Indeed, LinkedIn, Jobberman)
    jobType: String,             // NEW: Full-time, Part-time, Contract, etc.
    salary: String,              // NEW: Salary information if available
    scrapedAt: { type: Date, default: Date.now }
});

// Performance indexes
jobSchema.index({ scrapedAt: -1 });                    // Sort by newest first
jobSchema.index({ title: 'text', companyName: 'text' }); // Text search
jobSchema.index({ keyword: 1, location: 1 });         // Filter combinations
jobSchema.index({ source: 1 });                        // Source filtering
jobSchema.index({ jobType: 1 });                       // Job type filtering

// Unique compound index to prevent duplicate jobs (same title, company, location)
jobSchema.index(
  { title: 1, companyName: 1, jobLocation: 1 },
  {
    unique: true,
    partialFilterExpression: {
      title: { $exists: true },
      companyName: { $exists: true },
      jobLocation: { $exists: true }
    }
  }
);

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
