import { useState, useCallback } from 'react';
import { Job } from '../types/Job';
import { jobsApi } from '../services/api';

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (keyword?: string, location?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await jobsApi.getJobs(keyword, location);
      setJobs(response.jobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    jobs,
    loading,
    error,
    fetchJobs
  };
};
