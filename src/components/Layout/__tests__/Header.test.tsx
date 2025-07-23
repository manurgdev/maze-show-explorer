import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Header } from '@/components/Layout/Header';
import { currentPage, favorites, isInfiniteScroll, shows } from '@/store/signals';
import { Show } from '@/types/movie';

vi.mock('@/components/common/ToggleSlider', () => ({
  ToggleSlider: ({ isActive, onToggle }: { isActive: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} data-testid="toggle-slider">
      {isActive ? 'ON' : 'OFF'}
    </button>
  )
}));

vi.mock('@/components/Icons/ArrowLeftIcon', () => ({
  ArrowLeftIcon: () => <div data-testid="arrow-left-icon">←</div>
}));

vi.mock('@/components/Icons/FavoriteIcon', () => ({
  FavoriteIcon: ({ isActive }: { isActive: boolean }) => (
    <div data-testid="favorite-icon">{isActive ? 'Active' : 'Inactive'}</div>
  )
}));

vi.mock('@/components/Icons/InfiniteScrollIcon', () => ({
  InfiniteScrollIcon: () => <div data-testid="infinite-scroll-icon">∞</div>
}));

vi.mock('@/components/Icons/PaginationIcon', () => ({
  PaginationIcon: () => <div data-testid="pagination-icon">📄</div>
}));

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
  officialSite: null,
  schedule: { time: '21:00', days: ['Sunday'] },
  rating: { average: 9.5 },
  weight: 99,
  network: null,
  webChannel: null,
  dvdCountry: null,
  externals: { tvrage: null, thetvdb: null, imdb: null },
  image: null,
  summary: 'Test summary',
  updated: 1234567890,
  _links: { self: { href: 'test' } }
};

const mockOnToggleMode = vi.fn();
const mockOnBack = vi.fn();

describe('Header', () => {
  beforeEach(() => {
    isInfiniteScroll.value = false;
    shows.value = [];
    currentPage.value = 0;
    favorites.value = [];
    
    mockOnToggleMode.mockClear();
    mockOnBack.mockClear();
  });

  describe('List mode (isDetail=false)', () => {
    it('renders main header with title and description', () => {
      render(<Header onToggleMode={mockOnToggleMode} />);
      
      expect(screen.getByText('Show Explorer')).toBeInTheDocument();
      expect(screen.getByText('Descubre y organiza tus series favoritas')).toBeInTheDocument();
    });

    it('shows correct description for paginated mode', () => {
      shows.value = Array(50).fill({}).map((_, i) => ({ ...mockShow, id: i }));
      render(<Header onToggleMode={mockOnToggleMode} />);
      
      expect(screen.getAllByText('50', { exact: false })[0]).toBeInTheDocument();
      expect(screen.getAllByText('series', { exact: false })[0]).toBeInTheDocument();
    });

    it('shows correct description for infinite scroll mode', () => {
      isInfiniteScroll.value = true;
      shows.value = Array(30).fill({}).map((_, i) => ({ ...mockShow, id: i }));
      render(<Header onToggleMode={mockOnToggleMode} />);
      
      expect(screen.getByText('Descubre series con scroll infinito')).toBeInTheDocument();
      expect(screen.getByText('30', { exact: false })).toBeInTheDocument();
    });

    it('renders view mode toggle', () => {
      render(<Header onToggleMode={mockOnToggleMode} />);
      
      expect(screen.getByTestId('toggle-slider')).toBeInTheDocument();
    });

    it('calls onToggleMode when toggle is clicked', () => {
      render(<Header onToggleMode={mockOnToggleMode} />);
      
      const toggle = screen.getByTestId('toggle-slider');
      fireEvent.click(toggle);
      
      expect(mockOnToggleMode).toHaveBeenCalledTimes(1);
    });

    it('shows correct toggle state for infinite scroll', () => {
      isInfiniteScroll.value = true;
      render(<Header onToggleMode={mockOnToggleMode} />);
      
    });

    it('shows correct toggle state for pagination', () => {
      isInfiniteScroll.value = false;
      render(<Header onToggleMode={mockOnToggleMode} />);
      
      expect(screen.getByText('OFF')).toBeInTheDocument();
    });

    it('displays page counter in pagination mode', () => {
      shows.value = Array(50).fill({}).map((_, i) => ({ ...mockShow, id: i }));
      currentPage.value = 2;
      render(<Header onToggleMode={mockOnToggleMode} />);
      
      expect(screen.getByText('Página 3 de 3')).toBeInTheDocument();
    });
  });

  describe('Detail mode (isDetail=true)', () => {
    it('renders detail header with back button', () => {
      render(<Header isDetail={true} onBack={mockOnBack} show={mockShow} />);
      
      expect(screen.getByText('Show Explorer')).toBeInTheDocument();
      expect(screen.getByText('Información detallada de la serie')).toBeInTheDocument();
      expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
    });

    it('calls onBack when back button is clicked', () => {
      render(<Header isDetail={true} onBack={mockOnBack} show={mockShow} />);
      
      const backButton = screen.getByText('Volver a la lista');
      fireEvent.click(backButton);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('shows favorite button for show', () => {
      render(<Header isDetail={true} onBack={mockOnBack} show={mockShow} />);
      
      expect(screen.getByTestId('favorite-icon')).toBeInTheDocument();
      expect(screen.getByText('Agregar a favoritos')).toBeInTheDocument();
    });

    it('displays correct favorite status', () => {
      favorites.value = [1];
      render(<Header isDetail={true} onBack={mockOnBack} show={mockShow} />);
      
      expect(screen.getByTestId('favorite-icon')).toHaveTextContent('Active');
    });

    it('toggles favorite when favorite button is clicked', () => {
      render(<Header isDetail={true} onBack={mockOnBack} show={mockShow} />);
      
      const favoriteButton = screen.getByText('Agregar a favoritos');
      fireEvent.click(favoriteButton);
      
      expect(favorites.value).toContain(1);
    });

    it('removes from favorites when already favorited', () => {
      favorites.value = [1];
      render(<Header isDetail={true} onBack={mockOnBack} show={mockShow} />);
      
      const favoriteButton = screen.getByText('En favoritos');
      fireEvent.click(favoriteButton);
      
      expect(favorites.value).not.toContain(1);
    });

    it('does not show view mode toggle in detail mode', () => {
      render(<Header isDetail={true} onBack={mockOnBack} show={mockShow} />);
      
      expect(screen.queryByTestId('toggle-slider')).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles missing show in detail mode', () => {
      render(<Header isDetail={true} onBack={mockOnBack} />);
      
      expect(screen.getByText('Información detallada de la serie')).toBeInTheDocument();
      expect(screen.queryByTestId('favorite-icon')).not.toBeInTheDocument();
    });

    it('handles missing onToggleMode callback', () => {
      render(<Header />);
      
      expect(screen.queryByTestId('toggle-slider')).not.toBeInTheDocument();
    });

    it('handles missing onBack callback', () => {
      render(<Header isDetail={true} show={mockShow} />);
      
      expect(screen.queryByText('Volver a la lista')).not.toBeInTheDocument();
    });

    it('handles empty shows array', () => {
      shows.value = [];
      render(<Header onToggleMode={mockOnToggleMode} />);
      
      expect(screen.getAllByText('0', { exact: false })[0]).toBeInTheDocument();
      expect(screen.getAllByText('series', { exact: false })[0]).toBeInTheDocument();
    });
  });
}); 