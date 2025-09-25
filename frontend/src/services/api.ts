import axios from 'axios';
import { Job, JobResponse } from '../types/Job';
import { CVData, CVGenerationRequest, CVEnhancementRequest, CVResponse } from '../types/CV';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // Increased to 2 minutes for Render free tier cold starts and scraping operations
});

export const jobsApi = {
  // Get all jobs with keyword, location, source, and pagination filtering
  getJobs: async (
    keyword?: string,
    location?: string,
    source?: string,
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
    if (source && source !== 'All') {
      params.append('source', source);
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
  },

};

export const cvApi = {
  // Generate new CV
  generateCV: async (request: CVGenerationRequest): Promise<CVResponse> => {
    const response = await api.post('/api/cv/generate', request);
    return response.data;
  },

  // Enhance existing CV
  enhanceCV: async (formData: FormData): Promise<CVResponse> => {
    const response = await api.post('/api/cv/enhance', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Download CV PDF
  downloadCV: async (filename: string): Promise<Blob> => {
    const response = await api.get(`/api/cv/download/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  }
};