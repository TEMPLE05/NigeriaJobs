import React, { memo } from "react";
import { Job } from "../types/Job";
import { formatDate } from "../utils/helpers";

interface JobListItemProps {
  job: Job;
}

export const JobListItem: React.FC<JobListItemProps> = memo(({ job }) => {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-opacity-50"
      style={{
        backgroundColor: 'var(--card-bg-color)',
        borderColor: 'var(--card-border-color)',
      }}
      onClick={() => window.open(job.jobURL, '_blank')}
      role="button"
      tabIndex={0}
    >
      {/* Title */}
      <div className="flex-1 min-w-0 mb-2 sm:mb-0 sm:mr-4">
        <h3 className="text-xl font-semibold truncate hover:text-blue-600 transition-colors" style={{ color: 'var(--card-text-color)' }}>
          {job.title}
        </h3>
      </div>

      {/* Company */}
      <div className="flex-1 min-w-0 mb-2 sm:mb-0 sm:mr-4">
        <span className="text-base truncate" style={{ color: 'var(--card-secondary-text-color)' }}>
          {job.companyName}
        </span>
      </div>

      {/* Location */}
      <div className="flex-1 min-w-0 mb-2 sm:mb-0 sm:mr-4">
        <span className="text-sm truncate" style={{ color: 'var(--card-secondary-text-color)' }}>
          {job.jobLocation}
        </span>
      </div>

      {/* Date */}
      <div className="flex-1 min-w-0 mb-2 sm:mb-0 sm:mr-4">
        <span className="text-sm whitespace-nowrap" style={{ color: 'var(--card-secondary-text-color)' }}>
          {formatDate(job.scrapedAt)}
        </span>
      </div>

      {/* Salary */}
      {job.salary && (
        <div className="flex-shrink-0">
          <span className="text-sm font-medium" style={{ color: 'var(--card-text-color)' }}>
            {job.salary}
          </span>
        </div>
      )}
    </div>
  );
});