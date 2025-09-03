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

  const getJobTypeStyle = (type: string) => {
    const styles = {
      "Full-time": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "Part-time": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Contract: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Remote: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Internship: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    };
    return styles[type as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-sm hover:shadow-2xl transition-all duration-500 group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
            {job.title}
          </h3>

          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
            <div className="p-1 rounded-lg mr-3 bg-gradient-to-r from-blue-500 to-cyan-500">
              <Building className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium">{job.company}</span>
          </div>

          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <div className="p-1 rounded-lg mr-3 bg-gradient-to-r from-green-500 to-emerald-500">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="mr-4">{job.location}</span>
            <div className="p-1 rounded-lg mr-3 bg-gradient-to-r from-orange-500 to-red-500">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span>{formatDate(job.datePosted)}</span>
          </div>
        </div>

        <span
          className={`px-4 py-2 rounded-full text-xs font-medium ${getJobTypeStyle(
            job.jobType
          )} shadow-sm`}
        >
          {job.jobType}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
        {truncateDescription(job.description)}
      </p>

      {/* Salary + CTA */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-1">
            {job.salary}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            via {job.source}
          </div>
        </div>
        <a
          href={job.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:scale-105 transition-transform"
        >
          Apply Now
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Category */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
          {job.category}
        </span>
      </div>
    </div>
  );
};
