import React from 'react';

interface FilterSidebarProps {
  keyword: string;
  location: string;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  keyword,
  location,
  onKeywordChange,
  onLocationChange,
  isOpen,
  onClose
}) => {
  const clearFilters = () => {
    onKeywordChange('');
    onLocationChange('');
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
                  list="locations"
                />
                <datalist id="locations">
                  <option value="Lagos" />
                  <option value="Abuja" />
                  <option value="Port Harcourt" />
                  <option value="Kano" />
                  <option value="Ibadan" />
                  <option value="Remote" />
                  <option value="Enugu" />
                  <option value="Kaduna" />
                  <option value="Benin City" />
                  <option value="Owerri" />
                </datalist>
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
