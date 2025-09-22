import { useState, useCallback } from 'react';
import { Job, JobResponse } from '../types/Job';
import { jobsApi } from '../services/api';

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<JobResponse['pagination'] | null>(null);

  const fetchJobs = useCallback(async (
    keyword?: string,
    location?: string,
    source?: string,
    page: number = 1,
    limit: number = 8
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await jobsApi.getJobs(keyword, location, source, page, limit);
      setJobs(response.jobs);
      setPagination(response.pagination);
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
    pagination,
    fetchJobs
  };
};
