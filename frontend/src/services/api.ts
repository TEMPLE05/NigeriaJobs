import axios from 'axios';
import { Job, JobFilters, JobResponse, JobStats } from '../types/Job';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const jobsApi = {
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
    return response.data;
  }
};