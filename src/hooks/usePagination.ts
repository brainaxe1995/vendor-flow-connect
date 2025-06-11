
import { useState, useMemo } from 'react';

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
}

export const usePagination = (options: PaginationOptions = {}) => {
  const {
    initialPage = 1,
    initialPageSize = 20,
    totalItems = 0
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  const offset = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const reset = () => {
    setCurrentPage(initialPage);
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    offset,
    hasNextPage,
    hasPreviousPage,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    reset
  };
};
