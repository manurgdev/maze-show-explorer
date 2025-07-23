import { useSignals } from '@preact/signals-react/runtime';
import { type FC, useCallback,useEffect, useState } from 'react';

import { ITEMS_PER_PAGE, LOAD_MORE_THRESHOLD } from '@/config/items';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { fetchShows } from '@/services/api';
import {
  displayedShows,
  hasMoreFromApi,
  infiniteScrollApiPage,
  infiniteScrollIndex,
  infiniteScrollPosition,
  loading,
  shows} from '@/store/signals';
import { type Show } from '@/types/movie';

import { CheckmarkIcon } from './Icons/CheckmarkIcon';
import { ShowCard } from './ShowCard';

type ShowListInfiniteProps = {
  onShowClick: (show: Show) => void;
}

export const ShowListInfinite: FC<ShowListInfiniteProps> = ({ onShowClick }) => {
  useSignals();

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadInitialShows = async () => {
      if (shows.value.length === 0) {
        loading.value = true;
        try {
          const initialShows = await fetchShows(0);
          shows.value = initialShows;
          displayedShows.value = initialShows.slice(0, ITEMS_PER_PAGE);
          infiniteScrollIndex.value = ITEMS_PER_PAGE;
          infiniteScrollApiPage.value = 0;
          hasMoreFromApi.value = initialShows.length > 0;
        } catch (error) {
          console.error('Error loading initial shows:', error);
          hasMoreFromApi.value = false;
        } finally {
          loading.value = false;
          setIsInitialized(true);
        }
      } else {
        if (displayedShows.value.length === 0) {
          displayedShows.value = shows.value.slice(0, ITEMS_PER_PAGE);
          infiniteScrollIndex.value = ITEMS_PER_PAGE;
        }
        setIsInitialized(true);
      }
    };

    loadInitialShows();
  }, []);

  useEffect(() => {
    if (isInitialized && displayedShows.value.length > 0 && infiniteScrollPosition.value > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: infiniteScrollPosition.value,
          behavior: 'auto'
        });
      });
    }
  }, [isInitialized]);

  const loadMoreFromApi = useCallback(async () => {
    if (!hasMoreFromApi.value || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = infiniteScrollApiPage.value + 1;
      const newShows = await fetchShows(nextPage);

      if (newShows.length === 0) {
        hasMoreFromApi.value = false;
      } else {
        const existingIds = new Set(shows.value.map(show => show.id));
        const uniqueNewShows = newShows.filter(show => !existingIds.has(show.id));

        if (uniqueNewShows.length > 0) {
          const updatedShows = [...shows.value, ...uniqueNewShows];
          shows.value = updatedShows;
        }

        infiniteScrollApiPage.value = nextPage;
      }
    } catch (error) {
      console.error(`Error loading page ${infiniteScrollApiPage.value + 1}:`, error);
      hasMoreFromApi.value = false;
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore]);

  const loadMoreShows = useCallback(async () => {
    const remainingShows = shows.value.length - infiniteScrollIndex.value;

    if (remainingShows <= LOAD_MORE_THRESHOLD && hasMoreFromApi.value && !isLoadingMore) {
      await loadMoreFromApi();
    }

    if (infiniteScrollIndex.value < shows.value.length) {
      const nextShows = shows.value.slice(infiniteScrollIndex.value, infiniteScrollIndex.value + ITEMS_PER_PAGE);
      const existingIds = new Set(displayedShows.value.map(show => show.id));
      const uniqueNextShows = nextShows.filter(show => !existingIds.has(show.id));

      if (uniqueNextShows.length > 0) {
        displayedShows.value = [...displayedShows.value, ...uniqueNextShows];
      }
      infiniteScrollIndex.value = infiniteScrollIndex.value + ITEMS_PER_PAGE;
    }
  }, [loadMoreFromApi, isLoadingMore]);

  const hasMore = infiniteScrollIndex.value < shows.value.length || hasMoreFromApi.value;

  const { targetRef } = useInfiniteScroll(
    loadMoreShows,
    hasMore,
    loading.value || isLoadingMore,
    { threshold: 0.5 }
  );

  if (loading.value && displayedShows.value.length === 0) {
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
        {displayedShows.value.map((show) => (
          <ShowCard
            key={show.id}
            show={show}
            onClick={() => onShowClick(show)}
          />
        ))}
      </div>

      {(isLoadingMore || (hasMore && !loading.value)) && (
        <div className="mt-8 sm:mt-12 flex flex-col items-center gap-4" ref={targetRef}>
          {isLoadingMore ? (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
              <span className="text-sm font-medium">Cargando más series...</span>
            </div>
          ) : hasMore ? (
            <div className="text-center">
              <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mb-2 animate-pulse"></div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Desplázate para cargar más</p>
            </div>
          ) : null}
        </div>
      )}

      {!hasMore && displayedShows.value.length > 0 && (
        <div className="mt-8 sm:mt-12 text-center">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <CheckmarkIcon />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ¡Has visto todas las series disponibles!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: {displayedShows.value.length} series
            </p>
          </div>
        </div>
      )}
    </main>
  );
}; 