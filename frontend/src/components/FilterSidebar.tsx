import React, { useCallback } from 'react';
import { JobStats } from '../types/Job';

interface FilterSidebarProps {
  filters: {
    jobType: string;
    location: string;
    category: string;
    source: string;
  };
  onFilterChange: (key: string, value: string) => void;
  stats: JobStats | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  stats,
  isOpen,
  onClose
}) => {
  const clearFilters = useCallback(() => {
    (['jobType', 'location', 'category', 'source'] as const).forEach(key =>
      onFilterChange(key, '')
    );
  }, [onFilterChange]);

  const renderSelect = (
    id: string,
    label: string,
    value: string,
    options: { value: string; label: string }[],
    onChange: (val: string) => void
  ) => (
    <div>
      <label htmlFor={id} className="filter-label">
        {label}
      </label>
      <select
        id={id}
        title={label}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="filter-select"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="filter-overlay lg:hidden" onClick={onClose} />}

      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-80 glassmorphism
          transform transition-all duration-500 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:w-full lg:block
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
          <div className="glassmorphism rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold gradient-text mb-6">Filters</h3>

            <div className="space-y-4">
              {renderSelect(
                'jobType-select',
                'Job Type',
                filters.jobType,
                [
                  { value: '', label: 'All Types' },
                  { value: 'Full-time', label: 'Full-time' },
                  { value: 'Part-time', label: 'Part-time' },
                  { value: 'Contract', label: 'Contract' },
                  { value: 'Remote', label: 'Remote' },
                  { value: 'Internship', label: 'Internship' }
                ],
                val => onFilterChange('jobType', val)
              )}

              {renderSelect(
                'location-select',
                'Location',
                filters.location,
                [
                  { value: '', label: 'All Locations' },
                  ...(stats?.topLocations.map(loc => ({
                    value: loc._id,
                    label: loc._id
                  })) || [])
                ],
                val => onFilterChange('location', val)
              )}

              {renderSelect(
                'category-select',
                'Category',
                filters.category,
                [
                  { value: '', label: 'All Categories' },
                  ...(stats?.topCategories.map(cat => ({
                    value: cat._id,
                    label: cat._id
                  })) || [])
                ],
                val => onFilterChange('category', val)
              )}

              {renderSelect(
                'source-select',
                'Source',
                filters.source,
                [
                  { value: '', label: 'All Sources' },
                  { value: 'Jobberman', label: 'Jobberman' },
                  { value: 'MyJobMag', label: 'MyJobMag' },
                  { value: 'Hot Nigerian Jobs', label: 'Hot Nigerian Jobs' }
                ],
                val => onFilterChange('source', val)
              )}
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
