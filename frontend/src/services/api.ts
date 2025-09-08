import axios from 'axios';
import { Job } from '../types/Job';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const jobsApi = {
  // Get all jobs with keyword and location filtering
  getJobs: async (keyword?: string, location?: string): Promise<{ jobs: Job[] }> => {
    const params = new URLSearchParams();

    if (keyword && keyword.trim()) {
      params.append('keyword', keyword.trim());
    }
    if (location && location.trim()) {
      params.append('location', location.trim());
    }

    const response = await api.get(`/api/jobs?${params.toString()}`);
    return response.data;
  },

  // Trigger scraping
  triggerScraping: async (): Promise<{ message: string }> => {
    const response = await api.get('/api/scrape');
    return response.data;
  }
};