const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  salary: {
    type: String,
    default: 'Not specified'
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
    default: 'Full-time'
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  applicationUrl: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  datePosted: {
    type: Date,
    default: Date.now
  },
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ location: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ source: 1 });
jobSchema.index({ datePosted: -1 });
jobSchema.index({ scrapedAt: -1 });

module.exports = mongoose.model('Job', jobSchema);