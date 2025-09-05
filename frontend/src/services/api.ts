import axios from 'axios';
import { Job } from '../types/Job';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const jobsApi = {
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
    return response.data;
  }
};