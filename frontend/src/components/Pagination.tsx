import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Clamp currentPage to a safe value
  const safeCurrent = Math.min(Math.max(1, currentPage || 1), Math.max(1, totalPages || 1));

  const pages = useMemo<(number | '...')[]>(() => {
    const delta = 2;
    const out: (number | '...')[] = [];

    if (totalPages <= 1) return out;

    // always show first page
    out.push(1);

    const start = Math.max(2, safeCurrent - delta);
    const end = Math.min(totalPages - 1, safeCurrent + delta);

    if (start > 2) out.push('...');

    for (let i = start; i <= end; i++) out.push(i);

    if (end < totalPages - 1) out.push('...');

    // always show last page if different from first
    if (totalPages > 1) out.push(totalPages);

    return out;
  }, [safeCurrent, totalPages]);

  if (totalPages <= 1) return null;

  const changeTo = (page: number) => {
    if (page !== safeCurrent) onPageChange(page);
  };

  return (
    <nav
      aria-label="Pagination"
      className="flex justify-center items-center gap-2 mt-8"
    >
      <button
        onClick={() => changeTo(Math.max(1, safeCurrent - 1))}
        disabled={safeCurrent === 1}
        className="p-2 rounded-lg border border-gray-300 dark:border-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        title="Previous Page"
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span
            key={`ellipsis-${index}`}
            className="px-3 py-2 text-gray-500 dark:text-gray-400 select-none"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={`page-${page}`}
            onClick={() => changeTo(page)}
            aria-current={page === safeCurrent ? 'page' : undefined}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              page === safeCurrent
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 dark:border-white hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => changeTo(Math.min(totalPages, safeCurrent + 1))}
        disabled={safeCurrent === totalPages}
        className="p-2 rounded-lg border border-gray-300 dark:border-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        title="Next Page"
        aria-label="Next Page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
};
