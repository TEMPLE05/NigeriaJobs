import React from 'react';

interface FilterSidebarProps {
  keyword: string;
  location: string;
  source: string;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  keyword,
  location,
  source,
  onKeywordChange,
  onLocationChange,
  onSourceChange,
  isOpen,
  onClose
}) => {
  const clearFilters = () => {
    onKeywordChange('');
    onLocationChange('');
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
            <h3 className="text-xl font-bold gradient-text mb-6">Filters</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="keyword-input" className="filter-label">
                  Search Keywords
                </label>
                <input
                  id="keyword-input"
                  type="text"
                  placeholder="e.g., developer, engineer, designer"
                  value={keyword}
                  onChange={e => onKeywordChange(e.target.value)}
                  className="filter-select"
                />
              </div>

              <div>
                <label htmlFor="location-input" className="filter-label">
                  Job Location
                </label>
                <input
                  id="location-input"
                  type="text"
                  placeholder="e.g., lagos, abuja, remote"
                  value={location}
                  onChange={e => onLocationChange(e.target.value)}
                  className="filter-select"
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
                 </datalist>
              </div>

              <div>
                <label htmlFor="source-select" className="filter-label">
                  Job Source
                </label>
                <select
                  id="source-select"
                  value={source}
                  onChange={e => onSourceChange(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Sources</option>
                  <option value="Indeed">Indeed</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Jobberman">Jobberman</option>
                </select>
              </div>
            </div>

            <button onClick={clearFilters} className="clear-filters-btn">
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
