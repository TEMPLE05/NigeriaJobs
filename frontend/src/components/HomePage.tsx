import React, { Suspense, lazy } from 'react';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Job, JobResponse, FilterSuggestion } from '../types/Job';
import { ViewToggle } from './ViewToggle';
import { MASCOT_ICON_URL } from '../utils/branding';
import { JobListItem } from './JobListItem';

const JobCard = lazy(() => import('./JobCard').then(module => ({ default: module.JobCard })));
const LoadingSpinner = lazy(() => import('./LoadingSpinner').then(module => ({ default: module.LoadingSpinner })));
const ErrorMessage = lazy(() => import('./ErrorMessage').then(module => ({ default: module.ErrorMessage })));
const Pagination = lazy(() => import('./Pagination').then(module => ({ default: module.Pagination })));

interface HomePageProps {
  keyword: string;
  setKeyword: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  source: string;
  setSource: (value: string) => void;
  level: string;
  setLevel: (value: string) => void;
  cleanupLoading: boolean;
  cleanupMessage: string | null;
  handleCleanup: () => void;
  jobs: Job[];
  loading: boolean;
  error: string | null;
  pagination: JobResponse['pagination'] | null;
  filterSuggestions?: FilterSuggestion[];
  clearFilter?: (filterKey: FilterSuggestion['filter']) => void;
  currentPage: number;
  fetchJobs: (keyword?: string, location?: string, source?: string, page?: number, limit?: number, level?: string) => void;
  handlePageChange: (page: number) => void;
  viewMode: 'card' | 'list';
  setViewMode: (mode: 'card' | 'list') => void;
}

const HomePage: React.FC<HomePageProps> = ({
  keyword, setKeyword,
  location, setLocation,
  source, setSource,
  level, setLevel,
  cleanupLoading, cleanupMessage, handleCleanup,
  jobs, loading, error, pagination, filterSuggestions, clearFilter, currentPage, fetchJobs, handlePageChange,
  viewMode, setViewMode,
}) => {
  return (
    <>
      {/* Hero Section - Constrained */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="text-center mb-6 md:mb-12 relative">
          <div className="absolute inset-0 rounded-3xl opacity-30" style={{background: 'var(--hero-gradient)'}}></div>
          <div className="relative">
            <h2 className="text-3xl md:text-7xl font-bold mb-2 md:mb-6 leading-tight text-gray-900 dark:text-white">
              Find Your Next
              <span className="block text-4xl md:text-8xl font-extrabold text-gray-900 dark:text-white">
                Career
              </span>
            </h2>
            <p className="text-sm md:text-2xl text-gray-700 dark:text-gray-300 mb-3 md:mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover thousands of job opportunities from top Nigerian companies, all in one place
            </p>
            {/* Row on every breakpoint (not just sm+) — stacking these into 3
                full rows was the single biggest chunk of vertical space on
                mobile, pushing the filter card down toward the fixed nav. */}
            <div className="flex flex-row flex-wrap gap-2 md:gap-4 justify-center items-center">
              <div className="flex items-center space-x-1.5 md:space-x-2 text-gray-600 dark:text-gray-400">
                <div className="status-dot-green"></div>
                <span className="text-xs md:text-sm">Live Job Updates</span>
              </div>
              <div className="flex items-center space-x-1.5 md:space-x-2 text-gray-600 dark:text-gray-400">
                <div className="status-dot-blue"></div>
                <span className="text-xs md:text-sm">Real-time Search</span>
              </div>
              <div className="flex items-center space-x-1.5 md:space-x-2 text-gray-600 dark:text-gray-400">
                <div className="status-dot-purple"></div>
                <span className="text-xs md:text-sm">Verified Companies</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section - Constrained */}
        <div className="mb-8">
          <div className="rounded-2xl p-4 md:p-5 shadow-lg border" style={{backgroundColor: 'var(--filter-bg-color)', borderColor: 'var(--filter-border-color)', boxShadow: 'var(--filter-shadow)'}}>
            <h3 className="text-lg font-bold mb-3" style={{color: 'var(--card-text-color)'}}>Search & Filter</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label htmlFor="keyword-filter" className="block text-sm font-medium mb-1.5" style={{color: 'var(--card-secondary-text-color)'}}>
                  Search Keywords
                </label>
                <input
                  id="keyword-filter"
                  type="text"
                  placeholder="e.g., developer, engineer, designer"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--badge-border-color)', color: 'var(--card-text-color)'}}
                />
              </div>

              {/* Location + Experience Level share a row on mobile (md:contents
                  lets this wrapper "disappear" at md+, so both become direct
                  items of the outer 4-col grid instead) */}
              <div className="grid grid-cols-2 gap-3 md:contents">
              <div>
                <label htmlFor="location-filter" className="block text-sm font-medium mb-1.5" style={{color: 'var(--card-secondary-text-color)'}}>
                  Job Location
                </label>
                <input
                  id="location-filter"
                  type="text"
                  placeholder="e.g., lagos, abuja, remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  list="locations"
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--badge-border-color)', color: 'var(--card-text-color)'}}
                />
                <datalist id="locations">
                  <option value="Lagos" />
                  <option value="Abuja" />
                  <option value="Port Harcourt" />
                  <option value="Kano" />
                  <option value="Ibadan" />
                  <option value="Kaduna" />
                  <option value="Enugu" />
                  <option value="Benin City" />
                  <option value="Warri" />
                  <option value="Calabar" />
                  <option value="Owerri" />
                  <option value="Abeokuta" />
                  <option value="Jos" />
                  <option value="Ilorin" />
                  <option value="Sokoto" />
                  <option value="Onitsha" />
                  <option value="Maiduguri" />
                  <option value="Zaria" />
                  <option value="Aba" />
                  <option value="Uyo" />
                  <option value="Yola" />
                  <option value="Akure" />
                  <option value="Osogbo" />
                  <option value="Bauchi" />
                  <option value="Minna" />
                  <option value="Makurdi" />
                  <option value="Gombe" />
                  <option value="Jalingo" />
                  <option value="Damaturu" />
                  <option value="Katsina" />
                  <option value="Lokoja" />
                  <option value="Abakaliki" />
                  <option value="Umuahia" />
                  <option value="Awka" />
                  <option value="Asaba" />
                  <option value="Lafia" />
                  <option value="Dutse" />
                  <option value="Birnin Kebbi" />
                  <option value="Gusau" />
                  <option value="Suleja" />
                  <option value="Wukari" />
                  <option value="Idah" />
                  <option value="Nsukka" />
                  <option value="Ogbomosho" />
                  <option value="Ijebu Ode" />
                  <option value="Sagamu" />
                  <option value="Ikorodu" />
                  <option value="Epe" />
                  <option value="Badagry" />
                  <option value="Ikeja" />
                  <option value="Agege" />
                  <option value="Mushin" />
                  <option value="Oshodi" />
                  <option value="Surulere" />
                  <option value="Yaba" />
                  <option value="Lekki" />
                  <option value="Victoria Island" />
                  <option value="Ikoyi" />
                  <option value="Apapa" />
                  <option value="Marina" />
                  <option value="Opebi" />
                  <option value="Alausa" />
                  <option value="Ikeja GRA" />
                  <option value="Wuse" />
                  <option value="Maitama" />
                  <option value="Asokoro" />
                  <option value="Garki" />
                  <option value="Jabi" />
                  <option value="Utako" />
                  <option value="Wuye" />
                  <option value="Gwarinpa" />
                  <option value="Kubwa" />
                  <option value="Nyanya" />
                  <option value="Mararaba" />
                  <option value="Karu" />
                  <option value="Abaji" />
                  <option value="Bwari" />
                  <option value="Kwali" />
                  <option value="Gwagwalada" />
                  <option value="Kuje" />
                  <option value="Remote" />
                  <option value="Hybrid" />
                  <option value="fulltime" />
                  <option value="parttime" />
                  <option value="onsite" />
                </datalist>
              </div>

              <div>
                <label htmlFor="level-filter" className="block text-sm font-medium mb-1.5" style={{color: 'var(--card-secondary-text-color)'}}>
                  Experience Level
                </label>
                <select
                  id="level-filter"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--badge-border-color)', color: 'var(--card-text-color)'}}
                >
                  <option value="All">All Levels</option>
                  <option value="Entry">Entry</option>
                  <option value="Mid-level">Mid-level</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
              </div>

              <div>
                <label htmlFor="source-filter" className="block text-sm font-medium mb-1.5" style={{color: 'var(--card-secondary-text-color)'}}>
                  Job Source
                </label>
                <select
                  id="source-filter"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--badge-border-color)', color: 'var(--card-text-color)'}}
                >
                  <option value="All">All Sources</option>
                  <option value="Indeed">Indeed</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Jobberman">Jobberman</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3 gap-3">
              <button
                onClick={handleCleanup}
                disabled={cleanupLoading}
                title="Remove jobs older than 14 days"
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                style={{color: 'var(--card-secondary-text-color)'}}
              >
                {cleanupLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{cleanupLoading ? 'Cleaning...' : 'Clean Old Jobs'}</span>
              </button>

              <div className="flex items-center space-x-3">
                {cleanupMessage && (
                  <div className="text-xs font-medium px-2.5 py-1 rounded-lg border" style={{backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)', color: 'var(--card-text-color)'}}>
                    {cleanupMessage}
                  </div>
                )}
                <button
                  onClick={() => {
                    setKeyword('');
                    setLocation('');
                    setSource('All');
                    setLevel('All');
                  }}
                  className="px-5 py-1.5 rounded-xl font-medium text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-red-600 hover:bg-red-700 text-white"
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
                  fetchJobs(keyword.trim() || undefined, location.trim() || undefined, source, currentPage, 8);
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
          <motion.div id="jobs-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <ViewToggle viewMode={viewMode} onToggle={() => setViewMode(viewMode === 'card' ? 'list' : 'card')} />

            {jobs.length > 0 ? (
              viewMode === 'card' ? (
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
                <div className="space-y-4 mb-8">
                  {jobs.map(job => (
                    <Suspense key={job._id} fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-lg"></div>}>
                      <JobListItem job={job} />
                    </Suspense>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <img src={MASCOT_ICON_URL} alt="" className="w-20 h-20 mx-auto mb-4 opacity-70" />
                <h3 className="text-xl font-medium mb-2" style={{color: 'var(--card-text-color)'}}>
                  No jobs found
                </h3>
                <p style={{color: 'var(--card-secondary-text-color)'}}>
                  Try adjusting your search criteria or filters
                </p>
                {filterSuggestions && filterSuggestions.length > 0 && clearFilter && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    {filterSuggestions.map((s) => (
                      <button
                        key={s.filter}
                        onClick={() => clearFilter(s.filter)}
                        className="text-sm px-4 py-2 rounded-full border transition-colors hover:opacity-80"
                        style={{ borderColor: 'var(--badge-border-color)', color: 'var(--card-text-color)', backgroundColor: 'var(--card-bg-color)' }}
                      >
                        Remove "{s.label}" filter — {s.matchCount} job{s.matchCount === 1 ? '' : 's'} match{s.matchCount === 1 ? 'es' : ''} without it
                      </button>
                    ))}
                  </div>
                )}
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
          </motion.div>
        )}
      </div>
    </>
  );
};

export default HomePage;
