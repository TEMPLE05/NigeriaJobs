import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange
}) => {
  // Calculate hasNextPage and hasPrevPage if not provided
  const calculatedHasNextPage = hasNextPage !== undefined ? hasNextPage : currentPage < totalPages;
  const calculatedHasPrevPage = hasPrevPage !== undefined ? hasPrevPage : currentPage > 1;

  // Swipe functionality
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  // Page jump functionality
  const [jumpToPage, setJumpToPage] = useState('');
  const [isJumping, setIsJumping] = useState(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Swipe left: next page
    if (isLeftSwipe && calculatedHasNextPage) {
      onPageChange(currentPage + 1);
    }

    // Swipe right: previous page
    if (isRightSwipe && calculatedHasPrevPage) {
      onPageChange(currentPage - 1);
    }
  };

  // Page jump functionality
  const handlePageJump = async () => {
    const pageNum = parseInt(jumpToPage);
    if (pageNum >= 1 && pageNum <= totalPages && pageNum !== currentPage) {
      setIsJumping(true);
      try {
        onPageChange(pageNum);
        setJumpToPage('');
      } finally {
        setIsJumping(false);
      }
    }
  };

  const handlePageJumpKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePageJump();
    }
  };

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
      }
    }

    return pages;
  };

  return (
    <nav
      ref={paginationRef}
      className="flex flex-col items-center mt-8 px-2 sm:px-4 gap-4"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="navigation"
      aria-label="Pagination Navigation"
    >
      {/* Mobile: Enhanced Page Jump Input at top */}
      <div className="flex sm:hidden items-center justify-center space-x-3 w-full bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
        <label htmlFor="mobile-page-jump" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Jump to page:
        </label>
        <div className="flex items-center space-x-2">
          <input
            id="mobile-page-jump"
            type="number"
            min="1"
            max={totalPages}
            value={jumpToPage}
            onChange={(e) => setJumpToPage(e.target.value)}
            onKeyPress={handlePageJumpKeyPress}
            placeholder={`1-${totalPages}`}
            className="w-20 px-3 py-2 text-sm text-center border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            style={{
              backgroundColor: 'var(--card-bg-color)',
              borderColor: 'var(--badge-border-color)',
              color: 'var(--card-text-color)'
            }}
            aria-label={`Go to page (1-${totalPages})`}
          />
          <button
            onClick={handlePageJump}
            disabled={!jumpToPage || parseInt(jumpToPage) < 1 || parseInt(jumpToPage) > totalPages || isJumping}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 touch-manipulation"
            style={{
              backgroundColor: isJumping ? 'var(--badge-bg-color)' : 'var(--card-bg-color)',
              borderColor: 'var(--badge-border-color)',
              color: 'var(--card-text-color)'
            }}
            aria-label="Go to selected page"
          >
            {isJumping ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Pagination Controls with Page Jump on Desktop */}
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!calculatedHasPrevPage}
          className="flex items-center px-3 sm:px-4 py-3 sm:py-2 text-sm font-medium rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 touch-manipulation focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{
            backgroundColor: calculatedHasPrevPage ? 'var(--card-bg-color)' : 'transparent',
            borderColor: 'var(--badge-border-color)',
            color: 'var(--card-text-color)'
          }}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </button>

        {/* Page Numbers - Enhanced Mobile Experience */}
        <div className="flex items-center space-x-1 sm:space-x-2" role="group" aria-label="Page numbers">
          {getPageNumbers().map((page, index) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 sm:px-3 py-3 sm:py-2 text-sm font-medium rounded-lg border transition-all duration-200 touch-manipulation active:scale-95 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                page === currentPage
                  ? 'font-bold shadow-sm ring-2 ring-blue-500 ring-offset-2'
                  : 'hover:shadow-md'
              }`}
              style={{
                backgroundColor: page === currentPage ? 'var(--badge-bg-color)' : 'var(--card-bg-color)',
                borderColor: 'var(--badge-border-color)',
                color: 'var(--card-text-color)'
              }}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!calculatedHasNextPage}
          className="flex items-center px-3 sm:px-4 py-3 sm:py-2 text-sm font-medium rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 touch-manipulation focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{
            backgroundColor: calculatedHasNextPage ? 'var(--card-bg-color)' : 'transparent',
            borderColor: 'var(--badge-border-color)',
            color: 'var(--card-text-color)'
          }}
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>

        {/* Desktop Page Jump - On the side */}
        <div className="hidden sm:flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200 dark:border-gray-600">
          <span className="text-sm text-gray-600 dark:text-gray-400">Go to page:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={jumpToPage}
            onChange={(e) => setJumpToPage(e.target.value)}
            onKeyPress={handlePageJumpKeyPress}
            placeholder={`1-${totalPages}`}
            className="w-16 px-3 py-2 text-sm text-center border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            style={{
              backgroundColor: 'var(--card-bg-color)',
              borderColor: 'var(--badge-border-color)',
              color: 'var(--card-text-color)'
            }}
            aria-label={`Go to page (1-${totalPages})`}
          />
          <button
            onClick={handlePageJump}
            disabled={!jumpToPage || parseInt(jumpToPage) < 1 || parseInt(jumpToPage) > totalPages || isJumping}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95 touch-manipulation focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            style={{
              borderColor: 'var(--badge-border-color)',
              color: 'var(--card-text-color)'
            }}
            aria-label="Go to selected page"
          >
            {isJumping ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Page Info */}
      <div className="flex sm:hidden items-center justify-center text-xs text-gray-500 dark:text-gray-400 mt-2">
        Page {currentPage} of {totalPages}
      </div>
    </nav>
  );
};
