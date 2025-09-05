import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Moon,
  Sun,
  Briefcase,
  Menu,
} from 'lucide-react';
import { JobCard } from './components/JobCard';
import { FilterSidebar } from './components/FilterSidebar';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { useJobs } from './hooks/useJobs';



const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    jobType: '',
    location: '',
    category: '',
    source: ''
  });

  const { jobs, loading, error, fetchJobs } = useJobs();

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initial load
  useEffect(() => {
  fetchJobs();
}, [fetchJobs]);

  const handleSearch = useCallback(() => {
    fetchJobs(keyword.trim() || undefined, location.trim() || undefined);
  }, [keyword, location, fetchJobs]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [keyword, location, handleSearch]);

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'reset') {
      setFilters({
        jobType: '',
        location: '',
        category: '',
        source: ''
      });
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };


  return (
    <div className="min-h-screen transition-all duration-500">
      {/* Header */}
      <header className="glassmorphism sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(true)}
                className="header-mobile-menu"
                aria-label="Open filters menu"
              >
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="header-icon-gradient p-3 rounded-xl shadow-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    NigeriaJobs
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                    Find your dream job
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="dark-mode-toggle"
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 hero-bg-blur rounded-3xl"></div>
          <div className="relative">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
              Find Your Next
              <span className="block text-6xl md:text-8xl font-extrabold text-gray-900 dark:text-white">
                Career
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover thousands of job opportunities from top Nigerian companies, all in one place
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <div className="status-dot-green"></div>
                <span className="text-sm">Live Job Updates</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <div className="status-dot-blue"></div>
                <span className="text-sm">Real-time Search</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <div className="status-dot-purple"></div>
                <span className="text-sm">Verified Companies</span>
              </div>
            </div>
          </div>
        </div>



        {/* Search Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Keyword (e.g., engineer)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <input
              type="text"
              placeholder="Location (e.g., nigeria)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Mobile Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            stats={null}
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
          />

          {/* Job Results */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Job Opportunities
                </h3>
                <div className="text-gray-600 dark:text-gray-400 text-lg">
                  {loading ? (
                    <span className="flex items-center">
                      <div className="search-loading-spinner"></div>
                      Searching...
                    </span>
                  ) : (
                    `${jobs.length} jobs found`
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowFilters(true)}
                className="mobile-filter-button"
                aria-label="Open filters"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Error State */}
            {error && (
              <ErrorMessage
                message={error}
                onRetry={() => fetchJobs(keyword.trim() || undefined, location.trim() || undefined)}
              />
            )}

            {/* Loading State */}
            {loading && <LoadingSpinner />}

            {/* Jobs Grid */}
            {!loading && !error && (
              <>
                {jobs.length > 0 ? (
                  <div className="grid gap-6 mb-8">
                    {jobs.map((job, index) => (
                      <div
                        key={job._id}
                        className={`fade-in-up ${index < 5 ? `animation-delay-${index}00` : 'animation-delay-500'}`}
                      >
                        <JobCard job={job} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Search className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                      No jobs found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Try adjusting your search criteria or filters
                    </p>
                  </div>
                )}

              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="footer-icon-gradient p-2 rounded-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  NigeriaJobs
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Nigeria's premier job aggregation platform. We collect job postings from multiple sources 
                to help you find the perfect opportunity.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Jobs updated daily from trusted sources
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Browse Jobs</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Companies</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Salary Guide</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Career Tips</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 text-left">Help Center</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 text-left">Contact Us</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 text-left">Privacy Policy</button></li>
                <li><button className="hover:text-blue-600 dark:hover:text-blue-400 text-left">Terms of Service</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                © 2025 NigeriaJobs. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <button className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;