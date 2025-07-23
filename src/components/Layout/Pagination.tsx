import { type FC, useCallback } from 'react';

import { CaretLeftIcon } from '@/components/Icons/CaretLeftIcon';
import { CaretRightIcon } from '@/components/Icons/CaretRightIcon';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onGoToPage: (page: number) => void;
  hasMoreFromApi?: boolean;
  isLoadingMore?: boolean;
  totalItems?: number;
}

export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
  onGoToPage,
  hasMoreFromApi = false,
  isLoadingMore = false,
  totalItems = 0
}) => {
  const renderPaginationButtons = useCallback(() => {
    const buttons = [];
    const maxButtons = window.innerWidth < 640 ? 3 : 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(0, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => i !== currentPage && onGoToPage(i)}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${i === currentPage
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105 cursor-not-allowed'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105  cursor-pointer'
            }`}
        >
          {i + 1}
        </button>
      );
    }

    return buttons;
  }, [currentPage, totalPages, onGoToPage]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

        <div className="hidden sm:flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <span>Página {currentPage + 1} de {totalPages}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onPreviousPage}
            disabled={currentPage === 0}
            className="flex items-center px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
          >
            <CaretLeftIcon />
            <span className="hidden xs:inline">Anterior</span>
          </button>

          <div className="flex gap-1 sm:gap-2">
            {renderPaginationButtons()}
          </div>

          <button
            onClick={onNextPage}
            disabled={currentPage === totalPages - 1}
            className="flex items-center px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
          >
            <span className="hidden xs:inline">Siguiente</span>
            <CaretRightIcon />
          </button>
        </div>

        <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 text-center">
          <div>Página {currentPage + 1} de {totalPages}</div>
        </div>
      </div>

      {hasMoreFromApi && !isLoadingMore && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Total disponible: {totalItems} series+
          </p>
        </div>
      )}
    </div>
  );
}; 