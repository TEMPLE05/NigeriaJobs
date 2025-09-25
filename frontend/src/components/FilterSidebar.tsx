import React from 'react';
import { Search, MapPin, Briefcase, Building } from 'lucide-react';

interface FilterSidebarProps {
  keyword: string;
  location: string;
  jobType: string;
  source: string;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onJobTypeChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  keyword,
  location,
  jobType,
  source,
  onKeywordChange,
  onLocationChange,
  onJobTypeChange,
  onSourceChange,
  isOpen,
  onClose
}) => {
  const clearFilters = () => {
    onKeywordChange('');
    onLocationChange('');
    onJobTypeChange('');
    onSourceChange('All');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="filter-overlay lg:hidden" onClick={onClose} />}

      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-black border-r border-gray-200 dark:border-white
          transform transition-all duration-500 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:w-full lg:block lg:border-r-0
        `}
      >
        <div className="p-6 space-y-6">
          {/* Mobile header */}
          <div className="flex items-center justify-between lg:hidden">
            <h2 className="text-xl font-bold gradient-text">Filters</h2>
            <button
              onClick={onClose}
              className="mobile-filter-close"
              aria-label="Close filter sidebar"
            >
              ✕
            </button>
          </div>

          {/* Filters Section */}
          <div className="bg-gray-50 dark:bg-black rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-white">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold gradient-text">Filters</h3>
              {(keyword || location || jobType || source !== 'All') && (
                <div className="mt-2">
                  <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium rounded-full">
                    {[keyword, location, jobType, source !== 'All' ? source : ''].filter(Boolean).length} active
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="relative">
                <label htmlFor="keyword-input" className="filter-label flex items-center">
                  <Search className="w-4 h-4 mr-2 text-blue-500" />
                  Search Keywords
                  {keyword && (
                    <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium rounded-full">
                      Active
                    </span>
                  )}
                </label>
                <input
                  id="keyword-input"
                  type="text"
                  placeholder="e.g., developer, engineer, designer"
                  value={keyword}
                  onChange={e => onKeywordChange(e.target.value)}
                  className={`filter-select ${keyword ? 'ring-2 ring-blue-500/50 border-blue-500' : ''}`}
                />
              </div>

              <div className="relative">
                <label htmlFor="location-input" className="filter-label flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-green-500" />
                  Job Location
                  {location && (
                    <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium rounded-full">
                      Active
                    </span>
                  )}
                </label>
                <input
                  id="location-input"
                  type="text"
                  placeholder="e.g., lagos, abuja, remote"
                  value={location}
                  onChange={e => onLocationChange(e.target.value)}
                  className={`filter-select ${location ? 'ring-2 ring-green-500/50 border-green-500' : ''}`}
                  list="sidebar-locations"
                  autoComplete="off"
                />
                <datalist id="sidebar-locations">
                   <option value="lagos" />
                   <option value="abuja" />
                   <option value="port harcourt" />
                   <option value="kano" />
                   <option value="ibadan" />
                   <option value="kaduna" />
                   <option value="enugu" />
                   <option value="benin city" />
                   <option value="warri" />
                   <option value="calabar" />
                   <option value="owerri" />
                   <option value="abeokuta" />
                   <option value="jos" />
                   <option value="ilorin" />
                   <option value="sokoto" />
                   <option value="onitsha" />
                   <option value="maiduguri" />
                   <option value="zaria" />
                   <option value="aba" />
                   <option value="uyo" />
                   <option value="yola" />
                   <option value="akure" />
                   <option value="osogbo" />
                   <option value="bauchi" />
                   <option value="minna" />
                   <option value="makurdi" />
                   <option value="gombe" />
                   <option value="jalingo" />
                   <option value="damaturu" />
                   <option value="katsina" />
                   <option value="lokoja" />
                   <option value="remote" />
                   <option value="hybrid" />
                   <option value="fulltime" />
                   <option value="parttime" />
                   <option value="onsite" />
                 </datalist>
              </div>

              <div className="relative">
                <label htmlFor="jobtype-select" className="filter-label flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-purple-500" />
                  Job Type
                  {jobType && (
                    <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-medium rounded-full">
                      Active
                    </span>
                  )}
                </label>
                <select
                  id="jobtype-select"
                  value={jobType}
                  onChange={e => onJobTypeChange(e.target.value)}
                  className={`filter-select ${jobType ? 'ring-2 ring-purple-500/50 border-purple-500' : ''}`}
                >
                  <option value="">All Types</option>
                  <option value="fulltime">Full Time</option>
                  <option value="parttime">Part Time</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>

              <div className="relative">
                <label htmlFor="source-select" className="filter-label flex items-center">
                  <Building className="w-4 h-4 mr-2 text-orange-500" />
                  Job Source
                  {source !== 'All' && (
                    <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-full">
                      Active
                    </span>
                  )}
                </label>
                <select
                  id="source-select"
                  value={source}
                  onChange={e => onSourceChange(e.target.value)}
                  className={`filter-select ${source !== 'All' ? 'ring-2 ring-orange-500/50 border-orange-500' : ''}`}
                >
                  <option value="All">All Sources</option>
                  <option value="Indeed">Indeed</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Jobberman">Jobberman</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <button onClick={clearFilters} className="clear-filters-btn w-full flex items-center justify-center space-x-2">
                <span>🗑️</span>
                <span>Clear All Filters</span>
              </button>
              {(keyword || location || jobType || source !== 'All') && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Click to reset all active filters
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
