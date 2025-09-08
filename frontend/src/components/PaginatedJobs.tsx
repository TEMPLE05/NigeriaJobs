// src/components/PaginatedJobs.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Job } from '../types/Job';
import { JobCard } from './JobCard';
import { Pagination } from './Pagination';

interface PaginatedJobsProps {
  jobs: Job[];
  jobsPerPage?: number; // how many cards per page (default 3 -> 4 pages for 12 jobs)
}

/**
 * Simple client-side pagination wrapper.
 * - Keeps the same JobCard component and uses your existing Pagination component.
 * - Resets to page 1 whenever the jobs array changes (filter/search).
 */
export const PaginatedJobs: React.FC<PaginatedJobsProps> = ({ jobs, jobsPerPage = 3 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // If the jobs list changes (filters/search), reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [jobs]);

  const totalPages = Math.max(1, Math.ceil((jobs?.length || 0) / jobsPerPage));

  // current page slice
  const currentJobs = useMemo(() => {
    const start = (currentPage - 1) * jobsPerPage;
    return (jobs || []).slice(start, start + jobsPerPage);
  }, [jobs, currentPage, jobsPerPage]);

  // helper to safely pick a key
  const getKey = (job: Job, idx: number) =>
    // try common id fields then fallback to index
    ((job as any)._id ?? (job as any).id ?? idx).toString();

  if (!jobs || jobs.length === 0) {
    // keep same UI contract: caller handles "no jobs" case if necessary, but safe fallback
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No jobs to display.</p>
      </div>
    );
  }

  return (
    <>
      {/* Grid of job cards for the current page */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentJobs.map((job, idx) => (
          <div
            key={getKey(job, idx)}
            className={`fade-in-up animation-delay-${idx * 80}`}
          >
            <JobCard job={job} />
          </div>
        ))}
      </div>

      {/* Pagination controls (uses your existing Pagination component) */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          // scroll top for smooth UX
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />
    </>
  );
};
