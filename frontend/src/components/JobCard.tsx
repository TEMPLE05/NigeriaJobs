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
    <div
      className="rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-2xl transition-all duration-500 group border min-h-[410px] md:min-h-[455px] flex flex-col justify-between cursor-pointer"
      style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--badge-border-color)'}}
      onClick={() => window.open(job?.jobURL, '_blank')}
      role="button"
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-blue-600 transition-colors line-clamp-3 leading-tight" style={{color: 'var(--card-text-color)'}}>
              {job?.title || "Untitled Job"}
            </h3>
          </div>

          {job?.jobDuration && (
            <span className="px-2 py-1 rounded-full text-xs font-medium shadow-sm whitespace-nowrap ml-2 flex-shrink-0 border" style={{backgroundColor: 'var(--badge-bg-color)', color: 'var(--badge-text-color)', borderColor: 'var(--badge-border-color)'}}>
              {job.jobDuration}
            </span>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center" style={{color: 'var(--card-secondary-text-color)'}}>
            <div className="p-1.5 rounded-lg mr-3 bg-gradient-to-r from-blue-500 to-cyan-500 flex-shrink-0">
              <Building className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <a
              href={job?.companyURL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-blue-600 transition-colors truncate text-lg md:text-xl"
            >
              {job?.companyName || "Unknown Company"}
            </a>
          </div>

          <div className="flex items-center text-base md:text-lg" style={{color: 'var(--card-secondary-text-color)'}}>
            <div className="p-1.5 rounded-lg mr-3 bg-gradient-to-r from-green-500 to-emerald-500 flex-shrink-0">
              <MapPin className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="truncate mr-4">{job?.jobLocation || "Location not specified"}</span>
            <div className="p-1.5 rounded-lg mr-3 bg-gradient-to-r from-orange-500 to-red-500 flex-shrink-0">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="whitespace-nowrap">{job?.scrapedAt ? formatDate(job.scrapedAt) : "Date not available"}</span>
          </div>

          {/* Keyword Badge */}
          {job?.keyword && (
            <div>
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium border" style={{backgroundColor: 'var(--keyword-badge-bg-color)', color: 'var(--keyword-badge-text-color)', borderColor: 'var(--keyword-badge-border-color)'}}>
                {job.keyword}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-end mt-8">
        <a
          href={job?.jobURL}
          target="_blank"
          rel="noopener noreferrer"
          className="md:hidden bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-base md:text-lg"
        >
          Apply Now
          <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
        </a>
      </div>
    </div>
  );
};
