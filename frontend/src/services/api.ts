import axios from 'axios';
<<<<<<< HEAD
import { Job } from '../types/Job';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
=======
import { Job, JobFilters, JobResponse, JobStats } from '../types/Job';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
>>>>>>> 89eb64c6d6785a31b0aad1ae8cef44224dc9c6d3

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const jobsApi = {
<<<<<<< HEAD
  // Get all jobs with filtering
  getJobs: async (keyword?: string, location?: string): Promise<{ jobs: Job[] }> => {
    const params = new URLSearchParams();

    if (keyword) params.append('keyword', keyword);
    if (location) params.append('location', location);

    const response = await api.get(`/jobs?${params.toString()}`);
    return response.data; // { jobs: [...] }
  },

  // Trigger scraping
  triggerScraping: async (): Promise<{ message: string }> => {
    const response = await api.post('/scrape');
=======
  // Get all jobs with filtering and pagination
  getJobs: async (filters: JobFilters = {}): Promise<JobResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/jobs?${params.toString()}`);
    return response.data;
  },

  // Get job by ID
  getJobById: async (id: string): Promise<Job> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Get job statistics
  getStats: async (): Promise<JobStats> => {
    const response = await api.get('/jobs/stats/overview');
    return response.data;
  },

  // Trigger scraping
  triggerScraping: async (): Promise<{ message: string; jobsScraped: number }> => {
    const response = await api.post('/scraper/run');
>>>>>>> 89eb64c6d6785a31b0aad1ae8cef44224dc9c6d3
    return response.data;
  }
};