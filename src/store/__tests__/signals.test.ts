import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  currentPage,
  displayedShows,
  favorites,
  hasMoreFromApi,
  infiniteScrollApiPage,
  infiniteScrollIndex,
  infiniteScrollPosition,
  isInfiniteScroll,
  loading,
  resetInfiniteScrollState,
  restoreScrollPosition,
  savedScrollPosition,
  saveScrollPosition,
  selectedShow,
  shows,
  toggleFavorite,
  toggleViewMode,
} from '@/store/signals';
import { Show } from '@/types/movie';

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

const mockScrollTo = vi.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

Object.defineProperty(window, 'scrollY', {
  value: 100,
  writable: true,
});

Object.defineProperty(document.documentElement, 'scrollTop', {
  value: 150,
  writable: true,
});

vi.useFakeTimers();

const mockShow: Show = {
  id: 1,
  name: 'Breaking Bad',
  type: 'Scripted',
  language: 'English',
  genres: ['Drama', 'Crime'],
  status: 'Ended',
  runtime: 47,
  averageRuntime: 47,
  premiered: '2008-01-20',
  ended: '2013-09-29',
  officialSite: 'http://www.amc.com/shows/breaking-bad',
  schedule: {
    time: '21:00',
    days: ['Sunday']
  },
  rating: {
    average: 9.5
  },
  weight: 98,
  network: {
    id: 20,
    name: 'AMC',
    country: {
      name: 'United States',
      code: 'US',
      timezone: 'America/New_York'
    },
    officialSite: 'https://www.amc.com/'
  },
  webChannel: null,
  dvdCountry: null,
  externals: {
    tvrage: 18164,
    thetvdb: 81189,
    imdb: 'tt0903747'
  },
  image: {
    medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2400.jpg',
    original: 'https://static.tvmaze.com/uploads/images/original_untouched/0/2400.jpg'
  },
  summary: '<p><b>Breaking Bad</b> is a test show.</p>',
  updated: 1704794301,
  _links: {
    self: {
      href: 'https://api.tvmaze.com/shows/1'
    }
  }
};

describe('signals.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    
    shows.value = [];
    loading.value = false;
    currentPage.value = 0;
    selectedShow.value = null;
    isInfiniteScroll.value = false;
    displayedShows.value = [];
    infiniteScrollIndex.value = 0;
    infiniteScrollApiPage.value = 0;
    hasMoreFromApi.value = true;
    infiniteScrollPosition.value = 0;
    savedScrollPosition.value = 0;
    favorites.value = [];
    
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Signal initialization', () => {
    it('initializes all signals with correct default values', () => {
      expect(shows.value).toEqual([]);
      expect(loading.value).toBe(false);
      expect(currentPage.value).toBe(0);
      expect(selectedShow.value).toBe(null);
      expect(isInfiniteScroll.value).toBe(false);
      expect(displayedShows.value).toEqual([]);
      expect(infiniteScrollIndex.value).toBe(0);
      expect(infiniteScrollApiPage.value).toBe(0);
      expect(hasMoreFromApi.value).toBe(true);
      expect(infiniteScrollPosition.value).toBe(0);
      expect(savedScrollPosition.value).toBe(0);
    });

    it('signals are reactive and can be updated', () => {
      shows.value = [mockShow];
      loading.value = true;
      currentPage.value = 5;
      selectedShow.value = mockShow;
      isInfiniteScroll.value = true;

      expect(shows.value).toEqual([mockShow]);
      expect(loading.value).toBe(true);
      expect(currentPage.value).toBe(5);
      expect(selectedShow.value).toBe(mockShow);
      expect(isInfiniteScroll.value).toBe(true);
    });
  });

  describe('favorites', () => {
    it('initializes as empty array by default', () => {
      favorites.value = [];
      expect(favorites.value).toEqual([]);
    });

    it('can be manually set to simulate localStorage loading', () => {
      favorites.value = [1, 2, 3];
      expect(favorites.value).toEqual([1, 2, 3]);
    });
  });

  describe('toggleFavorite', () => {
    it('adds show to favorites when not present', () => {
      favorites.value = [2, 3];
      
      toggleFavorite(1);
      
      expect(favorites.value).toEqual([2, 3, 1]);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('favorites', JSON.stringify([2, 3, 1]));
    });

    it('removes show from favorites when present', () => {
      favorites.value = [1, 2, 3];
      
      toggleFavorite(2);
      
      expect(favorites.value).toEqual([1, 3]);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('favorites', JSON.stringify([1, 3]));
    });

    it('handles toggling when favorites is empty', () => {
      favorites.value = [];
      
      toggleFavorite(1);
      
      expect(favorites.value).toEqual([1]);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('favorites', JSON.stringify([1]));
    });

    it('handles toggling the only favorite', () => {
      favorites.value = [1];
      
      toggleFavorite(1);
      
      expect(favorites.value).toEqual([]);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('favorites', JSON.stringify([]));
    });

    it('does not modify original array reference', () => {
      const originalFavorites = [1, 2, 3];
      favorites.value = originalFavorites;
      
      toggleFavorite(4);
      
      expect(originalFavorites).toEqual([1, 2, 3]);
      expect(favorites.value).toEqual([1, 2, 3, 4]);
    });
  });

  describe('toggleViewMode', () => {
    it('toggles from paginated to infinite scroll mode', () => {
      isInfiniteScroll.value = false;
      currentPage.value = 5;
      displayedShows.value = [];
      
      toggleViewMode();
      
      expect(isInfiniteScroll.value).toBe(true);
      expect(currentPage.value).toBe(0);
      expect(infiniteScrollIndex.value).toBe(0);
      expect(infiniteScrollApiPage.value).toBe(0);
      expect(hasMoreFromApi.value).toBe(true);
      expect(infiniteScrollPosition.value).toBe(0);
    });

    it('toggles from infinite scroll to paginated mode', () => {
      isInfiniteScroll.value = true;
      currentPage.value = 3;
      
      toggleViewMode();
      
      expect(isInfiniteScroll.value).toBe(false);
      expect(currentPage.value).toBe(0);
    });

    it('does not reset infinite scroll state when displayedShows has content', () => {
      isInfiniteScroll.value = false;
      displayedShows.value = [mockShow];
      infiniteScrollIndex.value = 10;
      infiniteScrollApiPage.value = 2;
      
      toggleViewMode();
      
      expect(isInfiniteScroll.value).toBe(true);
      expect(infiniteScrollIndex.value).toBe(10);
      expect(infiniteScrollApiPage.value).toBe(2);
    });
  });

  describe('resetInfiniteScrollState', () => {
    it('resets all infinite scroll related signals', () => {
      displayedShows.value = [mockShow];
      infiniteScrollIndex.value = 10;
      infiniteScrollApiPage.value = 5;
      hasMoreFromApi.value = false;
      infiniteScrollPosition.value = 1000;
      
      resetInfiniteScrollState();
      
      expect(displayedShows.value).toEqual([]);
      expect(infiniteScrollIndex.value).toBe(0);
      expect(infiniteScrollApiPage.value).toBe(0);
      expect(hasMoreFromApi.value).toBe(true);
      expect(infiniteScrollPosition.value).toBe(0);
    });
  });

  describe('saveScrollPosition', () => {
    it('saves current scroll position for paginated mode', () => {
      isInfiniteScroll.value = false;
      window.scrollY = 500;
      
      saveScrollPosition();
      
      expect(savedScrollPosition.value).toBe(500);
    });

    it('saves current scroll position for infinite scroll mode', () => {
      isInfiniteScroll.value = true;
      window.scrollY = 800;
      
      saveScrollPosition();
      
      expect(infiniteScrollPosition.value).toBe(800);
      expect(savedScrollPosition.value).toBe(800);
    });

    it('uses documentElement.scrollTop when scrollY is not available', () => {
      Object.defineProperty(window, 'scrollY', { value: undefined, writable: true });
      document.documentElement.scrollTop = 300;
      isInfiniteScroll.value = false;
      
      saveScrollPosition();
      
      expect(savedScrollPosition.value).toBe(300);
    });

    it('handles both scrollY and documentElement.scrollTop being 0', () => {
      window.scrollY = 0;
      document.documentElement.scrollTop = 0;
      isInfiniteScroll.value = false;
      
      saveScrollPosition();
      
      expect(savedScrollPosition.value).toBe(0);
    });
  });

  describe('restoreScrollPosition', () => {
    it('restores saved scroll position for paginated mode', () => {
      isInfiniteScroll.value = false;
      savedScrollPosition.value = 600;
      
      restoreScrollPosition();
      vi.advanceTimersByTime(100);
      
      expect(mockScrollTo).toHaveBeenCalledWith({ top: 600 });
    });

    it('restores infinite scroll position for infinite scroll mode', () => {
      isInfiniteScroll.value = true;
      infiniteScrollPosition.value = 1200;
      savedScrollPosition.value = 600;
      
      restoreScrollPosition();
      vi.advanceTimersByTime(100);
      
      expect(mockScrollTo).toHaveBeenCalledWith({ top: 1200 });
    });

    it('uses setTimeout with 100ms delay', () => {
      isInfiniteScroll.value = false;
      savedScrollPosition.value = 400;
      
      restoreScrollPosition();
      
      expect(mockScrollTo).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(100);
      expect(mockScrollTo).toHaveBeenCalledWith({ top: 400 });
    });

    it('restores position 0 when no position is saved', () => {
      isInfiniteScroll.value = false;
      savedScrollPosition.value = 0;
      
      restoreScrollPosition();
      vi.advanceTimersByTime(100);
      
      expect(mockScrollTo).toHaveBeenCalledWith({ top: 0 });
    });
  });

  describe('integration scenarios', () => {
    it('handles complete favorite workflow', () => {
      favorites.value = [];
      
      toggleFavorite(1);
      toggleFavorite(2);
      toggleFavorite(3);
      
      expect(favorites.value).toEqual([1, 2, 3]);
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(3);
      
      toggleFavorite(2);
      
      expect(favorites.value).toEqual([1, 3]);
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(4);
    });

    it('handles complete view mode transition', () => {
      isInfiniteScroll.value = false;
      currentPage.value = 3;
      savedScrollPosition.value = 500;
      
      toggleViewMode();
      
      expect(isInfiniteScroll.value).toBe(true);
      expect(currentPage.value).toBe(0);
      
      window.scrollY = 1000;
      saveScrollPosition();
      
      expect(infiniteScrollPosition.value).toBe(1000);
      
      toggleViewMode();
      
      expect(isInfiniteScroll.value).toBe(false);
      expect(currentPage.value).toBe(0);

      restoreScrollPosition();
      vi.advanceTimersByTime(100);
      
      expect(mockScrollTo).toHaveBeenCalledWith({ top: savedScrollPosition.value });
    });

    it('handles scroll management across mode changes', () => {
      isInfiniteScroll.value = false;
      window.scrollY = 300;
      saveScrollPosition();
      
      expect(savedScrollPosition.value).toBe(300);
      
      toggleViewMode();
      window.scrollY = 800;
      saveScrollPosition();
      
      expect(infiniteScrollPosition.value).toBe(800);
      expect(savedScrollPosition.value).toBe(800);
      
      restoreScrollPosition();
      vi.advanceTimersByTime(100);
      
      expect(mockScrollTo).toHaveBeenCalledWith({ top: 800 });
    });
  });
}); 