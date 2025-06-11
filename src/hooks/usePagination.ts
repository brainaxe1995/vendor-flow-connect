
import { useState } from 'react';

export interface PaginationState {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export const usePagination = (initialPerPage: number = 20) => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    per_page: initialPerPage,
    total: 0,
    total_pages: 0,
  });

  const setPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const setPerPage = (per_page: number) => {
    setPagination(prev => ({ ...prev, per_page, page: 1 }));
  };

  const setTotalData = (total: number) => {
    const total_pages = Math.ceil(total / pagination.per_page);
    setPagination(prev => ({ ...prev, total, total_pages }));
  };

  const goToFirstPage = () => setPage(1);
  const goToLastPage = () => setPage(pagination.total_pages);
  const goToNextPage = () => {
    if (pagination.page < pagination.total_pages) {
      setPage(pagination.page + 1);
    }
  };
  const goToPrevPage = () => {
    if (pagination.page > 1) {
      setPage(pagination.page - 1);
    }
  };

  return {
    pagination,
    setPage,
    setPerPage,
    setTotalData,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPrevPage,
    hasNextPage: pagination.page < pagination.total_pages,
    hasPrevPage: pagination.page > 1,
  };
};
