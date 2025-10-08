import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../services/api';
import { Job } from '../types/Job';
import { JobCard } from './JobCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePersistentState } from '../hooks/usePersistentState';
import { ViewToggle } from './ViewToggle';
import { JobListItem } from './JobListItem';

const PopulateJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = usePersistentState<'card' | 'list'>('jobViewMode', 'card');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        setLoading(true);
        // Fetch all jobs with a large limit
        const response = await jobsApi.getJobs(undefined, undefined, undefined, 1, 1000);
        setJobs(response.jobs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchAllJobs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col transition-all duration-500" style={{backgroundColor: 'var(--bg-color)'}}>
      {/* Header */}
      <header className="flex-shrink-0 border-b shadow-sm" style={{backgroundColor: 'var(--header-bg-color)', borderColor: 'var(--header-border-color)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <div className="flex items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  JobVista.NG
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  Find your dream job
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 rounded-3xl opacity-30" style={{background: 'var(--hero-gradient)'}}></div>
          <div className="relative">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
              All Jobs in Database
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Complete list of all job postings from our database
            </p>
            <div className="flex justify-center">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total Jobs: <span className="text-blue-600 dark:text-blue-400">{jobs.length}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Results - Full Width */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Error State */}
        {error && (
          <div className="max-w-7xl mx-auto mb-8">
            <ErrorMessage
              message={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-7xl mx-auto mb-8">
            <LoadingSpinner />
          </div>
        )}

        {/* Jobs Grid - Full Width */}
        {!loading && !error && (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {jobs.length > 0 ? (
              <div className={viewMode === 'card' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mb-8' : 'flex flex-col space-y-4 mb-8'}>
                {jobs.map((job, index) => (
                  <div
                    key={job._id}
                    className={`fade-in-up ${index < 5 ? `animation-delay-${index}00` : 'animation-delay-500'}`}
                  >
                    {viewMode === 'card' ? <JobCard job={job} /> : <JobListItem job={job} />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <img src="/logo.app/in-site.png" alt="Logo" className="h-20 w-auto mx-auto" />
                </div>
                <h3 className="text-xl font-medium mb-2" style={{color: 'var(--card-text-color)'}}>
                  No jobs found
                </h3>
                <p style={{color: 'var(--card-secondary-text-color)'}}>
                  The database appears to be empty.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t" style={{backgroundColor: 'var(--footer-bg-color)', borderColor: 'var(--footer-border-color)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-1.5">
                <img src="/logo.app/in-site.png" alt="Logo" className="h-7 w-auto" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  JobVista.NG
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Job aggregation platform
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Browse Jobs
              </Link>
              <Link to="/help" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Help
              </Link>
              <Link to="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                About
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              <ViewToggle viewMode={viewMode} onToggle={() => setViewMode(viewMode === 'card' ? 'list' : 'card')} />
              <button className="p-3 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110" title="Light mode">
                <Sun className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110" title="Dark mode">
                <Moon className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110" title="System mode">
                <Monitor className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="border-t pt-4 mt-4" style={{borderColor: 'var(--footer-border-color)'}}>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              © 2025 JobVista.NG. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PopulateJobs;