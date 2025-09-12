import axios from 'axios';
import { Job, JobResponse } from '../types/Job';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // Increased to 2 minutes for Render free tier cold starts and scraping operations
});

export const jobsApi = {
  // Get all jobs with keyword, location, and pagination filtering
  getJobs: async (
    keyword?: string,
    location?: string,
    page: number = 1,
    limit: number = 8
  ): Promise<JobResponse> => {
    const params = new URLSearchParams();

    if (keyword && keyword.trim()) {
      params.append('keyword', keyword.trim());
    }
    if (location && location.trim()) {
      params.append('location', location.trim());
    }

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/api/jobs?${params.toString()}`);
    return response.data;
  },

  // Trigger scraping
  triggerScraping: async (): Promise<{ message: string }> => {
    const response = await api.get('/api/scrape');
    return response.data;
  },

  // Trigger cleanup of old jobs
  triggerCleanup: async (): Promise<{ message: string; deletedCount: number }> => {
    const response = await api.delete('/api/cleanup');
    return response.data;
  }
};