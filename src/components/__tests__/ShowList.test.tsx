import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ShowList } from '@/components/ShowList';
import { currentPage, loading, shows } from '@/store/signals';
import { Show } from '@/types/movie';

vi.mock('@/services/api', () => ({
  fetchShows: vi.fn().mockResolvedValue([])
}));

vi.mock('@/components/ShowCard', () => ({
  ShowCard: ({ show, onClick }: { show: Show; onClick: () => void }) => (
    <div data-testid={`show-card-${show.id}`} onClick={onClick}>
      {show.name}
    </div>
  )
}));

vi.mock('@/components/Layout/Pagination', () => ({
  Pagination: ({ currentPage, totalPages }: { currentPage: number; totalPages: number }) => (
    <div data-testid="pagination">
      Page {currentPage + 1} of {totalPages}
    </div>
  )
}));

const mockShows: Show[] = [
  {
    id: 1,
    name: 'Show 1',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama'],
    status: 'Running',
    runtime: 60,
    averageRuntime: 60,
    premiered: '2023-01-01',
    ended: null,
    officialSite: null,
    schedule: { time: '21:00', days: ['Monday'] },
    rating: { average: 8.5 },
    weight: 95,
    network: null,
    webChannel: null,
    dvdCountry: null,
    externals: { tvrage: null, thetvdb: null, imdb: null },
    image: null,
    summary: 'Test summary',
    updated: 1234567890,
    _links: { self: { href: 'test' } }
  },
  {
    id: 2,
    name: 'Show 2',
    type: 'Scripted',
    language: 'English',
    genres: ['Comedy'],
    status: 'Ended',
    runtime: 30,
    averageRuntime: 30,
    premiered: '2020-01-01',
    ended: '2022-01-01',
    officialSite: null,
    schedule: { time: '20:00', days: ['Tuesday'] },
    rating: { average: 7.5 },
    weight: 85,
    network: null,
    webChannel: null,
    dvdCountry: null,
    externals: { tvrage: null, thetvdb: null, imdb: null },
    image: null,
    summary: 'Test summary 2',
    updated: 1234567890,
    _links: { self: { href: 'test2' } }
  }
];

const mockOnShowClick = vi.fn();

describe('ShowList', () => {
  beforeEach(() => {
    shows.value = [];
    loading.value = false;
    currentPage.value = 0;
    mockOnShowClick.mockClear();
  });

  it('shows loading state when loading is true', () => {
    loading.value = true;
    render(<ShowList onShowClick={mockOnShowClick} />);
    
    expect(screen.getByText('Cargando series...')).toBeInTheDocument();
    expect(screen.getByText('Esto puede tomar unos segundos')).toBeInTheDocument();
  });

  it('renders show cards when shows are available', async () => {
    shows.value = mockShows;
    render(<ShowList onShowClick={mockOnShowClick} />);

    await waitFor(() => {
      expect(screen.getByTestId('show-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('show-card-2')).toBeInTheDocument();
      expect(screen.getByText('Show 1')).toBeInTheDocument();
      expect(screen.getByText('Show 2')).toBeInTheDocument();
    });
  });

  it('renders pagination component', async () => {
    shows.value = mockShows;
    render(<ShowList onShowClick={mockOnShowClick} />);

    await waitFor(() => {
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
  });

  it('displays correct page information in pagination', async () => {
    shows.value = Array(50).fill({}).map((_, i) => ({ ...mockShows[0], id: i, name: `Show ${i}` }));
    currentPage.value = 1;
    render(<ShowList onShowClick={mockOnShowClick} />);

    await waitFor(() => {
      expect(screen.getByText(/Page 2 of/)).toBeInTheDocument();
    });
  });

  it('shows loading spinner with correct styling', () => {
    loading.value = true;
    render(<ShowList onShowClick={mockOnShowClick} />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('border-t-blue-600');
  });

  it('applies correct grid layout classes', async () => {
    shows.value = mockShows;
    render(<ShowList onShowClick={mockOnShowClick} />);

    await waitFor(() => {
      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-2');
      expect(grid).toHaveClass('sm:grid-cols-3');
      expect(grid).toHaveClass('md:grid-cols-4');
      expect(grid).toHaveClass('lg:grid-cols-6');
    });
  });
}); 