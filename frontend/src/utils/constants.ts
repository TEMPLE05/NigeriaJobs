export const API_ENDPOINTS = {
  JOBS: '/jobs',
  STATS: '/jobs/stats/overview',
  SCRAPER: '/scraper/run'
} as const;

export const JOB_TYPES = [
  'Full-time',
  'Part-time', 
  'Contract',
  'Internship',
  'Remote'
] as const;

export const JOB_SOURCES = [
  'Jobberman',
  'MyJobMag', 
  'Hot Nigerian Jobs'
] as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
} as const;