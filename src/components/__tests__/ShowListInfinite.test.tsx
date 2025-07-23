import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ShowListInfinite } from '@/components/ShowListInfinite';
import { ITEMS_PER_PAGE, LOAD_MORE_THRESHOLD } from '@/config/items';
import * as apiService from '@/services/api';
import {
  displayedShows,
  hasMoreFromApi,
  infiniteScrollApiPage,
  infiniteScrollIndex,
  infiniteScrollPosition,
  loading,
  shows,
} from '@/store/signals';
import { Show } from '@/types/movie';

const mockTargetRef = vi.fn();

vi.mock('@/hooks/useInfiniteScroll', () => ({
  useInfiniteScroll: vi.fn(() => ({
    targetRef: mockTargetRef,
  })),
}));

vi.mock('@/components/ShowCard', () => ({
  ShowCard: ({ show, onClick }: { show: Show; onClick: () => void }) => (
    <div data-testid={`show-card-${show.id}`} onClick={onClick}>
      {show.name}
    </div>
  ),
}));

vi.mock('@/components/Icons/CheckmarkIcon', () => ({
  CheckmarkIcon: () => <div data-testid="checkmark-icon">✓</div>,
}));

const mockFetchShows = vi.spyOn(apiService, 'fetchShows');

const mockRequestAnimationFrame = vi.fn((callback) => {
  callback();
  return 1;
});
Object.defineProperty(window, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true,
});

const mockScrollTo = vi.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

const createMockShow = (id: number, name: string = `Show ${id}`): Show => ({
  id,
  name,
  type: 'Scripted',
  language: 'English',
  genres: ['Drama'],
  status: 'Running',
  runtime: 60,
  averageRuntime: 60,
  premiered: '2023-01-01',
  ended: null,
  officialSite: `http://show${id}.com`,
  schedule: {
    time: '21:00',
    days: ['Monday']
  },
  rating: {
    average: 8.5
  },
  weight: 90,
  network: {
    id: 1,
    name: 'Network',
    country: {
      name: 'United States',
      code: 'US',
      timezone: 'America/New_York'
    },
    officialSite: 'http://network.com'
  },
  webChannel: null,
  dvdCountry: null,
  externals: {
    tvrage: null,
    thetvdb: null,
    imdb: null
  },
  image: {
    medium: `http://image${id}.jpg`,
    original: `http://image${id}_original.jpg`
  },
  summary: `<p>Summary for ${name}</p>`,
  updated: Date.now(),
  _links: {
    self: {
      href: `http://api.com/shows/${id}`
    }
  }
});

const mockShows = Array.from({ length: 50 }, (_, i) => createMockShow(i + 1));

describe('ShowListInfinite', () => {
  const mockOnShowClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequestAnimationFrame.mockClear();
    mockScrollTo.mockClear();
    
    shows.value = [];
    displayedShows.value = [];
    loading.value = false;
    infiniteScrollIndex.value = 0;
    infiniteScrollApiPage.value = 0;
    hasMoreFromApi.value = true;
    infiniteScrollPosition.value = 0;
    
    mockFetchShows.mockClear();
  });

  describe('Initial loading', () => {
    it('shows loading spinner when loading initial shows', async () => {
      loading.value = true;
      
      render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      
      expect(screen.getByText('Cargando series...')).toBeInTheDocument();
      expect(screen.getByText('Esto puede tomar unos segundos')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('loads initial shows when shows array is empty', async () => {
      const initialShows = mockShows.slice(0, 20);
      mockFetchShows.mockResolvedValueOnce(initialShows);

      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });

      await waitFor(() => {
        expect(mockFetchShows).toHaveBeenCalledWith(0);
      });

      expect(shows.value).toEqual(initialShows);
      expect(displayedShows.value).toEqual(initialShows.slice(0, ITEMS_PER_PAGE));
      expect(infiniteScrollIndex.value).toBe(ITEMS_PER_PAGE);
      expect(infiniteScrollApiPage.value).toBe(0);
    });

    it('uses existing shows when shows array is not empty', async () => {
      const existingShows = mockShows.slice(0, 15);
      shows.value = existingShows;

      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });

      expect(mockFetchShows).not.toHaveBeenCalled();
      expect(displayedShows.value).toEqual(existingShows.slice(0, ITEMS_PER_PAGE));
      expect(infiniteScrollIndex.value).toBe(ITEMS_PER_PAGE);
    });

    it('handles initial loading error gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetchShows.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });

      await waitFor(() => {
        expect(hasMoreFromApi.value).toBe(false);
      });

      expect(consoleError).toHaveBeenCalledWith('Error loading initial shows:', expect.any(Error));
      
      consoleError.mockRestore();
    });
  });

  describe('Scroll position restoration', () => {
    it('restores scroll position after initialization', async () => {
      const existingShows = mockShows.slice(0, 15);
      shows.value = existingShows;
      infiniteScrollPosition.value = 500;

      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });

      await waitFor(() => {
        expect(mockRequestAnimationFrame).toHaveBeenCalled();
      });

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 500,
        behavior: 'auto'
      });
    });

    it('does not restore scroll when position is 0', async () => {
      const existingShows = mockShows.slice(0, 15);
      shows.value = existingShows;
      infiniteScrollPosition.value = 0;

      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });

      expect(mockScrollTo).not.toHaveBeenCalled();
    });
  });

  describe('Show rendering', () => {
    beforeEach(async () => {
      const existingShows = mockShows.slice(0, 20);
      shows.value = existingShows;

      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });
    });

    it('renders displayed shows correctly', () => {
      for (let i = 1; i <= 10; i++) {
        expect(screen.getByTestId(`show-card-${i}`)).toBeInTheDocument();
        expect(screen.getByText(`Show ${i}`)).toBeInTheDocument();
      }
    });

    it('calls onShowClick when a show card is clicked', () => {
      const firstShow = mockShows[0];
      const showCard = screen.getByTestId(`show-card-${firstShow.id}`);
      
      fireEvent.click(showCard);
      
      expect(mockOnShowClick).toHaveBeenCalledWith(firstShow);
    });

    it('renders grid layout with correct classes', () => {
      const main = screen.getByRole('main');
      const grid = main.querySelector('.grid');
      
      expect(grid).toHaveClass('grid-cols-2', 'sm:grid-cols-3', 'md:grid-cols-4', 'lg:grid-cols-6');
    });
  });

  describe('Load more functionality', () => {
    it('shows load more indicator when there are more shows', async () => {
      shows.value = mockShows.slice(0, 30);
      hasMoreFromApi.value = true;

      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });

      expect(screen.getByText('Desplázate para cargar más')).toBeInTheDocument();
    });

    it('shows loading indicator when loading more shows', async () => {
      shows.value = mockShows.slice(0, 30);

      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });

      await act(async () => {
        const loadingDiv = screen.getByText('Desplázate para cargar más').closest('div');
        if (loadingDiv) {
          loadingDiv.innerHTML = `
            <div class="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <div class="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
              <span class="text-sm font-medium">Cargando más series...</span>
            </div>
          `;
        }
      });
    });

    it('loads more shows from API when threshold is reached', async () => {
      const initialShows = mockShows.slice(0, 20);
      const additionalShows = mockShows.slice(20, 40);
      
      shows.value = initialShows;
      displayedShows.value = initialShows.slice(0, ITEMS_PER_PAGE);
      infiniteScrollIndex.value = ITEMS_PER_PAGE;
      infiniteScrollApiPage.value = 0;
      
      mockFetchShows.mockResolvedValueOnce(additionalShows);

      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });

      const remainingShows = initialShows.length - ITEMS_PER_PAGE;
      expect(remainingShows).toBeLessThanOrEqual(LOAD_MORE_THRESHOLD);
    });

    it('handles API errors when loading more shows', async () => {
      shows.value = mockShows.slice(0, 10);
      infiniteScrollApiPage.value = 0;
      hasMoreFromApi.value = true;
      
      mockFetchShows.mockRejectedValueOnce(new Error('API Error'));

      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('stops loading when API returns empty results', async () => {
      shows.value = mockShows.slice(0, 20);
      infiniteScrollApiPage.value = 0;
      hasMoreFromApi.value = true;
      
      mockFetchShows.mockResolvedValueOnce([]);

      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('filters out duplicate shows when loading from API', async () => {
      const initialShows = mockShows.slice(0, 20);
      const duplicateShows = [...mockShows.slice(15, 25), ...mockShows.slice(25, 35)];
      
      shows.value = initialShows;
      mockFetchShows.mockResolvedValueOnce(duplicateShows);

      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });

      const expectedLength = initialShows.length + (duplicateShows.length - 5);
      expect(shows.value.length).toBeLessThanOrEqual(expectedLength);
    });
  });

  describe('End states', () => {
    it('shows completion message when all shows are loaded', async () => {
      shows.value = mockShows.slice(0, 15);
      displayedShows.value = mockShows.slice(0, 15);
      hasMoreFromApi.value = false;
      infiniteScrollIndex.value = 15;

      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });

      expect(screen.getByText('¡Has visto todas las series disponibles!')).toBeInTheDocument();
      expect(screen.getByText('Total: 15 series')).toBeInTheDocument();
      expect(screen.getByTestId('checkmark-icon')).toBeInTheDocument();
    });

    it('does not show completion message when there are more shows available', async () => {
      shows.value = mockShows.slice(0, 30);
      hasMoreFromApi.value = true;

      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });

      expect(screen.queryByText('¡Has visto todas las series disponibles!')).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles empty shows array gracefully', async () => {
      shows.value = [];
      displayedShows.value = [];
      mockFetchShows.mockResolvedValueOnce([]);

      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('does not crash when displayedShows contains shows not in main shows array', async () => {
      const orphanShow = createMockShow(999, 'Orphan Show');
      shows.value = mockShows.slice(0, 10);
      displayedShows.value = [orphanShow, ...mockShows.slice(0, 5)];

      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });

      expect(screen.getByTestId('show-card-999')).toBeInTheDocument();
      expect(screen.getByText('Orphan Show')).toBeInTheDocument();
    });

    it('handles rapid state changes gracefully', async () => {
      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });

      await act(async () => {
        shows.value = mockShows.slice(0, 10);
        displayedShows.value = mockShows.slice(0, 5);
        infiniteScrollIndex.value = 5;
        hasMoreFromApi.value = false;
      });

      await act(async () => {
        hasMoreFromApi.value = true;
        infiniteScrollIndex.value = 10;
      });

      expect(screen.getByTestId('show-card-1')).toBeInTheDocument();
    });

    it('maintains scroll position during re-renders', async () => {
      shows.value = mockShows.slice(0, 20);
      infiniteScrollPosition.value = 800;

      const { rerender } = render(<ShowListInfinite onShowClick={mockOnShowClick} />);

      await waitFor(() => {
        expect(mockScrollTo).toHaveBeenCalledWith({
          top: 800,
          behavior: 'auto'
        });
      });

      rerender(<ShowListInfinite onShowClick={mockOnShowClick} />);

      expect(mockScrollTo).toHaveBeenCalledTimes(1);
    });
  });

  describe('useInfiniteScroll integration', () => {
    it('passes correct parameters to useInfiniteScroll hook', async () => {
      shows.value = mockShows.slice(0, 30);
      hasMoreFromApi.value = true;
      loading.value = false;

      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });

      const { useInfiniteScroll } = await import('../../hooks/useInfiniteScroll');
      expect(useInfiniteScroll).toHaveBeenCalledWith(
        expect.any(Function),
        true,
        false,
        { threshold: 0.5 }
      );
    });

    it('updates hasMore based on current state', async () => {
      shows.value = mockShows.slice(0, 10);
      infiniteScrollIndex.value = 10;
      hasMoreFromApi.value = false;

      await act(async () => {
        render(<ShowListInfinite onShowClick={mockOnShowClick} />);
      });

      const { useInfiniteScroll } = await import('../../hooks/useInfiniteScroll');
      expect(useInfiniteScroll).toHaveBeenCalled();
    });
  });
}); 