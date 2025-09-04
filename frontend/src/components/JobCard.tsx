import React from "react";
import { Job } from "../types/Job";
import { Building, MapPin, Calendar, ExternalLink } from "lucide-react";

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-sm hover:shadow-2xl transition-all duration-500 group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
            {job?.title || "Untitled Job"}
          </h3>

          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
            <div className="p-1 rounded-lg mr-3 bg-gradient-to-r from-blue-500 to-cyan-500">
              <Building className="w-4 h-4 text-white" />
            </div>
            <a
              href={job?.companyURL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-blue-600 transition-colors"
            >
              {job?.companyName || "Unknown Company"}
            </a>
          </div>

          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <div className="p-1 rounded-lg mr-3 bg-gradient-to-r from-green-500 to-emerald-500">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="mr-4">{job?.jobLocation || "Location not specified"}</span>
            <div className="p-1 rounded-lg mr-3 bg-gradient-to-r from-orange-500 to-red-500">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span>{job?.scrapedAt ? formatDate(job.scrapedAt) : "Date not available"}</span>
          </div>
        </div>

        {job?.jobDuration && (
          <span className="px-4 py-2 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 shadow-sm">
            {job.jobDuration}
          </span>
        )}
      </div>

      {/* CTA */}
      <div className="flex justify-end">
        <a
          href={job?.jobURL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:scale-105 transition-transform"
        >
          Apply Now
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
