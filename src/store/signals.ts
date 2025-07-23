import { signal } from '@preact/signals-react';

import { type Show } from '@/types/movie';

export const shows = signal<Show[]>([]);
export const loading = signal<boolean>(false);
export const currentPage = signal<number>(0);
export const selectedShow = signal<Show | null>(null);
export const isInfiniteScroll = signal<boolean>(false);
export const displayedShows = signal<Show[]>([]);
export const infiniteScrollIndex = signal<number>(0);
export const infiniteScrollApiPage = signal<number>(0);
export const hasMoreFromApi = signal<boolean>(true);
export const infiniteScrollPosition = signal<number>(0);

const loadFavorites = (): number[] => {
  try {
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const favorites = signal<number[]>(loadFavorites());

export const toggleFavorite = (showId: number) => {
  const currentFavorites = [...favorites.value];
  const index = currentFavorites.indexOf(showId);
  
  if (index > -1) {
    currentFavorites.splice(index, 1);
  } else {
    currentFavorites.push(showId);
  }
  
  favorites.value = currentFavorites;
  localStorage.setItem('favorites', JSON.stringify(currentFavorites));
};

export const toggleViewMode = () => {
  isInfiniteScroll.value = !isInfiniteScroll.value;
  currentPage.value = 0;
  
  if (isInfiniteScroll.value && displayedShows.value.length === 0) {
    infiniteScrollIndex.value = 0;
    infiniteScrollApiPage.value = 0;
    hasMoreFromApi.value = true;
    infiniteScrollPosition.value = 0;
  }
};

export const resetInfiniteScrollState = () => {
  displayedShows.value = [];
  infiniteScrollIndex.value = 0;
  infiniteScrollApiPage.value = 0;
  hasMoreFromApi.value = true;
  infiniteScrollPosition.value = 0;
};

export const savedScrollPosition = signal<number>(0);

export const saveScrollPosition = () => {
  const currentPosition = window.scrollY || document.documentElement.scrollTop;
  
  if (isInfiniteScroll.value) {
    infiniteScrollPosition.value = currentPosition;
  }
  
  savedScrollPosition.value = currentPosition;
};

export const restoreScrollPosition = () => {
  setTimeout(() => {
    const positionToRestore = isInfiniteScroll.value 
      ? infiniteScrollPosition.value 
      : savedScrollPosition.value;
      
    window.scrollTo({ 
      top: positionToRestore
    });
  }, 100);
}; 