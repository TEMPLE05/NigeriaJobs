import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  Moon,
  Sun,
  Briefcase,
  Trash2,
  Monitor,
  FileSearch,
} from 'lucide-react';
import { useJobs } from './hooks/useJobs';
import { jobsApi } from './services/api';
import PopulateJobs from './components/PopulateJobs';
import HelpCenter from './components/HelpCenter';
import ContactUs from './components/ContactUs';

// Lazy load components for better performance
const JobCard = lazy(() => import('./components/JobCard').then(module => ({ default: module.JobCard })));
const LoadingSpinner = lazy(() => import('./components/LoadingSpinner').then(module => ({ default: module.LoadingSpinner })));
const ErrorMessage = lazy(() => import('./components/ErrorMessage').then(module => ({ default: module.ErrorMessage })));
const Pagination = lazy(() => import('./components/Pagination').then(module => ({ default: module.Pagination })));



const App: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Theme management with system preference detection
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [isDark, setIsDark] = useState(false);

  const { jobs, loading, error, pagination, fetchJobs } = useJobs();

  // System theme detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      const systemPrefersDark = mediaQuery.matches;
      const shouldBeDark = theme === 'dark' || (theme === 'system' && systemPrefersDark);

      setIsDark(shouldBeDark);

      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Initial theme application
    updateTheme();

    // Listen for system theme changes
    mediaQuery.addEventListener('change', updateTheme);

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [theme]);

  // Theme set functions
  const setLightTheme = () => {
    setTheme('light');
    localStorage.setItem('theme', 'light');
  };

  const setDarkTheme = () => {
    setTheme('dark');
    localStorage.setItem('theme', 'dark');
  };

  const setSystemTheme = () => {
    setTheme('system');
    localStorage.setItem('theme', 'system');
  };

  // Get theme icon
  const getThemeIcon = () => {
    if (theme === 'light') return <Sun className="w-5 h-5 text-yellow-500" />;
    if (theme === 'dark') return <Moon className="w-5 h-5 text-blue-400" />;
    return <Monitor className="w-5 h-5 text-gray-400" />;
  };

  // Get theme tooltip
  const getThemeTooltip = () => {
    if (theme === 'light') return "Switch to dark mode";
    if (theme === 'dark') return "Use system preference";
    return "Switch to light mode";
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Initial load
  useEffect(() => {
    fetchJobs(undefined, undefined, 1, 8);
  }, [fetchJobs]);

  const handleSearch = useCallback(() => {
    setCurrentPage(1); // Reset to first page when searching
    fetchJobs(keyword.trim() || undefined, location.trim() || undefined, 1, 8);
  }, [keyword, location, fetchJobs]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchJobs(keyword.trim() || undefined, location.trim() || undefined, page, 8);
  }, [keyword, location, fetchJobs]);

  const handleCleanup = async () => {
    if (cleanupLoading) return;

    setCleanupLoading(true);
    setCleanupMessage(null);

    try {
      const result = await jobsApi.triggerCleanup();
      setCleanupMessage(`✅ ${result.message}`);
      // Refresh jobs after cleanup
      setCurrentPage(1);
      fetchJobs(keyword.trim() || undefined, location.trim() || undefined, 1, 8);
    } catch (error) {
      setCleanupMessage(`❌ Failed to cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCleanupLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => setCleanupMessage(null), 5000);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [keyword, location, handleSearch]);


  return (
    <Routes>
      <Route path="/" element={
        <div className="min-h-screen flex flex-col transition-all duration-500" style={{backgroundColor: 'var(--bg-color)'}}>
      {/* Header */}
      <header className="flex-shrink-0 border-b shadow-sm" style={{backgroundColor: 'var(--header-bg-color)', borderColor: 'var(--header-border-color)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto">

      {/* Hero Section - Constrained */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 rounded-3xl opacity-30" style={{background: 'var(--hero-gradient)'}}></div>
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

        {/* Search Section - Constrained */}
        <div className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search jobs by keyword (e.g., engineer, developer, designer)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--badge-border-color)', color: 'var(--card-text-color)'}}
            />
          </div>
        </div>

        {/* Filter Section - Constrained */}
        <div className="mb-8">
          <div className="rounded-2xl p-6 shadow-lg border" style={{backgroundColor: 'var(--filter-bg-color)', borderColor: 'var(--filter-border-color)', boxShadow: 'var(--filter-shadow)'}}>
            <h3 className="text-xl font-bold mb-4" style={{color: 'var(--card-text-color)'}}>Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="keyword-filter" className="block text-sm font-medium mb-2" style={{color: 'var(--card-secondary-text-color)'}}>
                  Search Keywords
                </label>
                <input
                  id="keyword-filter"
                  type="text"
                  placeholder="e.g., developer, engineer, designer"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--badge-border-color)', color: 'var(--card-text-color)'}}
                />
              </div>

              <div>
                <label htmlFor="location-filter" className="block text-sm font-medium mb-2" style={{color: 'var(--card-secondary-text-color)'}}>
                  Job Location
                </label>
                <input
                  id="location-filter"
                  type="text"
                  placeholder="e.g., lagos, abuja, remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--badge-border-color)', color: 'var(--card-text-color)'}}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCleanup}
                  disabled={cleanupLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  {cleanupLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>{cleanupLoading ? 'Cleaning...' : 'Clean Old Jobs'}</span>
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Remove jobs older than 7 days
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {cleanupMessage && (
                  <div className="text-sm font-medium px-3 py-1 rounded-lg bg-white dark:bg-gray-700 border">
                    {cleanupMessage}
                  </div>
                )}
                <button
                  onClick={() => {
                    setKeyword('');
                    setLocation('');
                  }}
                  className="px-6 py-2 rounded-xl font-medium transition-all duration-300" style={{backgroundColor: '#dc2626', color: 'white'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Results - Full Width */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-2" style={{color: 'var(--card-text-color)'}}>
            Job Opportunities
          </h3>
          <div className="text-lg" style={{color: 'var(--card-secondary-text-color)'}}>
            {loading ? (
              <span className="flex items-center">
                <div className="search-loading-spinner"></div>
                Searching...
              </span>
            ) : (
              pagination ?
                `Showing ${jobs.length} of ${pagination.totalJobs} jobs (Page ${pagination.currentPage} of ${pagination.totalPages})` :
                `${jobs.length} jobs found`
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>}>
              <ErrorMessage
                message={error}
                onRetry={() => {
                  fetchJobs(keyword.trim() || undefined, location.trim() || undefined, currentPage, 8);
                }}
              />
            </Suspense>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>}>
              <LoadingSpinner />
            </Suspense>
          </div>
        )}

        {/* Jobs Grid - Full Width */}
        {!loading && !error && (
          <>
            {jobs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mb-8">
                {jobs.map((job, index) => (
                  <div
                    key={job._id}
                    className={`fade-in-up ${index < 5 ? `animation-delay-${index}00` : 'animation-delay-500'}`}
                  >
                    <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-96 rounded-2xl"></div>}>
                      <JobCard job={job} />
                    </Suspense>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FileSearch className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-medium mb-2" style={{color: 'var(--card-text-color)'}}>
                  No jobs found
                </h3>
                <p style={{color: 'var(--card-secondary-text-color)'}}>
                  Try adjusting your search criteria or filters
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination && (
              <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-12 rounded-lg"></div>}>
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                  onPageChange={handlePageChange}
                />
              </Suspense>
            )}
          </>
        )}
      </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t" style={{backgroundColor: 'var(--footer-bg-color)', borderColor: 'var(--footer-border-color)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="footer-icon-gradient p-1.5 rounded-lg">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  NigeriaJobs
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
              <button
                onClick={setLightTheme}
                className={`p-3 rounded-lg transition-all duration-200 hover:scale-110 ${theme === 'light' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 shadow-md' : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                title="Light mode"
              >
                <Sun className="w-5 h-5" />
              </button>
              <button
                onClick={setDarkTheme}
                className={`p-3 rounded-lg transition-all duration-200 hover:scale-110 ${theme === 'dark' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 shadow-md' : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                title="Dark mode"
              >
                <Moon className="w-5 h-5" />
              </button>
              <button
                onClick={setSystemTheme}
                className={`p-3 rounded-lg transition-all duration-200 hover:scale-110 ${theme === 'system' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 shadow-md' : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                title="System mode"
              >
                <Monitor className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="border-t pt-4 mt-4" style={{borderColor: 'var(--footer-border-color)'}}>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              © 2025 NigeriaJobs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
        </div>
      } />
      <Route path="/populate-jobs" element={<PopulateJobs />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/contact" element={<ContactUs />} />
    </Routes>
  );
};

export default App;