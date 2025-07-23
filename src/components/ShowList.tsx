import { useSignals } from '@preact/signals-react/runtime';
import { type FC, useCallback, useEffect, useRef,useState } from 'react';

import { ITEMS_PER_PAGE, PAGES_AHEAD_THRESHOLD } from '@/config/items';
import { fetchShows } from '@/services/api';
import { currentPage,loading, shows } from '@/store/signals';
import { type Show } from '@/types/movie';

import { Pagination } from './Layout/Pagination';
import { ShowCard } from './ShowCard';

type ShowListProps = {
  onShowClick: (show: Show) => void;
}

export const ShowList: FC<ShowListProps> = ({ onShowClick }) => {
  useSignals();
  
  const [currentApiPage, setCurrentApiPage] = useState(0);
  const [hasMoreFromApi, setHasMoreFromApi] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const previousPageRef = useRef(0);

  useEffect(() => {
    const loadInitialShows = async () => {
      if (shows.value.length === 0) {
        loading.value = true;
        try {
          const initialShows = await fetchShows(0);
          shows.value = initialShows;
          setCurrentApiPage(0);
          setHasMoreFromApi(initialShows.length > 0);
        } catch (error) {
          console.error('Error loading initial shows:', error);
          setHasMoreFromApi(false);
        } finally {
          loading.value = false;
          setIsInitialized(true);
        }
      } else {
        setIsInitialized(true);
      }
    };

    loadInitialShows();
  }, []);

  const loadMoreFromApi = useCallback(async () => {
    if (!hasMoreFromApi || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentApiPage + 1;
      const newShows = await fetchShows(nextPage);
      
      if (newShows.length === 0) {
        setHasMoreFromApi(false);
      } else {
        const existingIds = new Set(shows.value.map(show => show.id));
        const uniqueNewShows = newShows.filter(show => !existingIds.has(show.id));
        
        if (uniqueNewShows.length > 0) {
          const updatedShows = [...shows.value, ...uniqueNewShows];
          shows.value = updatedShows;
        }
        
        setCurrentApiPage(nextPage);
      }
    } catch (error) {
      console.error(`Error loading page ${currentApiPage + 1}:`, error);
      setHasMoreFromApi(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMoreFromApi, isLoadingMore, currentApiPage]);

  const checkAndLoadMoreIfNeeded = useCallback(() => {
    if (!isInitialized) return;
    
    const totalPages = Math.ceil(shows.value.length / ITEMS_PER_PAGE);
    const pagesRemaining = totalPages - (currentPage.value + 1);
    
    if (pagesRemaining <= PAGES_AHEAD_THRESHOLD && hasMoreFromApi && !isLoadingMore) {
      loadMoreFromApi();
    }
  }, [isInitialized, hasMoreFromApi, isLoadingMore, loadMoreFromApi]);

  useEffect(() => {
    if (isInitialized) {
      checkAndLoadMoreIfNeeded();
    }
  }, [isInitialized, checkAndLoadMoreIfNeeded]);

  useEffect(() => {
    const currentPageNum = currentPage.value;
    if (isInitialized && previousPageRef.current !== currentPageNum) {
      previousPageRef.current = currentPageNum;
      checkAndLoadMoreIfNeeded();
    }
  });

  const totalPages = Math.ceil(shows.value.length / ITEMS_PER_PAGE);
  const startIndex = currentPage.value * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentShows = shows.value.slice(startIndex, endIndex);

  const handlePreviousPage = useCallback(() => {
    if (currentPage.value > 0) {
      currentPage.value = currentPage.value - 1;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleNextPage = useCallback(() => {
    const totalPages = Math.ceil(shows.value.length / ITEMS_PER_PAGE);
    if (currentPage.value < totalPages - 1) {
      currentPage.value = currentPage.value + 1;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleGoToPage = useCallback((page: number) => {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading.value) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-300 border-t-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">Cargando series...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Esto puede tomar unos segundos</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
        {currentShows.map((show) => (
          <ShowCard
            key={show.id}
            show={show}
            onClick={() => onShowClick(show)}
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage.value}
        totalPages={totalPages}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        onGoToPage={handleGoToPage}
        hasMoreFromApi={hasMoreFromApi}
        isLoadingMore={isLoadingMore}
        totalItems={shows.value.length}
      />
    </main>
  );
}; 