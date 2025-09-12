import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    <div
      ref={paginationRef}
      className="flex items-center justify-center space-x-2 mt-8"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!calculatedHasPrevPage}
        className="flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: calculatedHasPrevPage ? 'var(--card-bg-color)' : 'transparent',
          borderColor: 'var(--badge-border-color)',
          color: 'var(--card-text-color)'
        }}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
              page === currentPage ? 'font-bold' : ''
            }`}
            style={{
              backgroundColor: page === currentPage ? 'var(--badge-bg-color)' : 'var(--card-bg-color)',
              borderColor: 'var(--badge-border-color)',
              color: 'var(--card-text-color)'
            }}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!calculatedHasNextPage}
        className="flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: calculatedHasNextPage ? 'var(--card-bg-color)' : 'transparent',
          borderColor: 'var(--badge-border-color)',
          color: 'var(--card-text-color)'
        }}
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  );
};
