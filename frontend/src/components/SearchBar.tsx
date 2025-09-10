import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { jobsApi } from '../services/api';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearchSubmit: () => void;
  onCleanupComplete?: () => void;
  loading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onCleanupComplete,
  loading = false
}) => {
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  const handleCleanup = async () => {
    if (cleanupLoading) return;

    setCleanupLoading(true);
    setCleanupMessage(null);

    try {
      const result = await jobsApi.triggerCleanup();
      setCleanupMessage(`✅ ${result.message}`);
      if (onCleanupComplete) {
        onCleanupComplete();
      }
    } catch (error) {
      setCleanupMessage(`❌ Failed to cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCleanupLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => setCleanupMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search jobs, companies, or keywords..."
            className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-white rounded-xl bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
            disabled={loading}
          />
          {loading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </form>

      {/* Cleanup Section */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
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

        {cleanupMessage && (
          <div className="text-sm font-medium px-3 py-1 rounded-lg bg-white dark:bg-gray-700 border">
            {cleanupMessage}
          </div>
        )}
      </div>
    </div>
  );
};