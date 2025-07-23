import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ShowCard } from '@/components/ShowCard';
import { favorites } from '@/store/signals';
import { Show } from '@/types/movie';

vi.mock('@/components/Icons/MovieIcon', () => ({
  MovieIcon: () => <div data-testid="movie-icon">Movie Icon</div>
}));

vi.mock('@/components/Icons/StarIcon', () => ({
  StarIcon: () => <div data-testid="star-icon">Star</div>
}));

vi.mock('@/components/Icons/FavoriteIcon', () => ({
  FavoriteIcon: ({ isActive }: { isActive: boolean }) => (
    <div data-testid="favorite-icon">{isActive ? 'Active' : 'Inactive'}</div>
  )
}));

const mockShow: Show = {
  id: 1,
  name: 'Breaking Bad',
  type: 'Scripted',
  language: 'English',
  genres: ['Drama', 'Crime', 'Thriller'],
  status: 'Ended',
  runtime: 47,
  averageRuntime: 47,
  premiered: '2008-01-20',
  ended: '2013-09-29',
  officialSite: 'http://www.amc.com/shows/breaking-bad',
  schedule: { time: '21:00', days: ['Sunday'] },
  rating: { average: 9.5 },
  weight: 99,
  network: {
    id: 20,
    name: 'AMC',
    country: { name: 'United States', code: 'US', timezone: 'America/New_York' },
    officialSite: 'https://www.amc.com/'
  },
  webChannel: null,
  dvdCountry: null,
  externals: { tvrage: 18164, thetvdb: 81189, imdb: 'tt0903747' },
  image: {
    medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2400.jpg',
    original: 'https://static.tvmaze.com/uploads/images/original_untouched/0/2400.jpg'
  },
  summary: '<p>Walter White, a struggling high school chemistry teacher, is diagnosed with inoperable lung cancer. He turns to a life of crime, producing and selling methamphetamine with his former student Jesse Pinkman.</p>',
  updated: 1704067242,
  _links: { self: { href: 'https://api.tvmaze.com/shows/169' } }
};

const mockShowWithoutImage: Show = {
  ...mockShow,
  id: 2,
  image: null
};

const mockOnClick = vi.fn();

describe('ShowCard', () => {
  beforeEach(() => {
    favorites.value = [];
    mockOnClick.mockClear();
  });

  it('renders show information correctly', () => {
    render(<ShowCard show={mockShow} onClick={mockOnClick} />);
    
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    expect(screen.getByText('Drama')).toBeInTheDocument();
    expect(screen.getByText('Crime')).toBeInTheDocument();
    expect(screen.getByText('2008')).toBeInTheDocument();
    expect(screen.getByText('Finalizada')).toBeInTheDocument();
    expect(screen.getByText('9.5')).toBeInTheDocument();
  });

  it('displays show image when available', () => {
    render(<ShowCard show={mockShow} onClick={mockOnClick} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockShow.image!.medium);
    expect(image).toHaveAttribute('alt', 'Breaking Bad');
  });

  it('shows MovieIcon when image is not available', () => {
    render(<ShowCard show={mockShowWithoutImage} onClick={mockOnClick} />);
    
    expect(screen.getByTestId('movie-icon')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    render(<ShowCard show={mockShow} onClick={mockOnClick} />);
    
    const card = screen.getByText('Breaking Bad').closest('div');
    fireEvent.click(card!);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('toggles favorite status when favorite button is clicked', () => {
    render(<ShowCard show={mockShow} onClick={mockOnClick} />);
    
    const favoriteButton = screen.getByLabelText('Agregar a favoritos');
    fireEvent.click(favoriteButton);
    
    expect(favorites.value).toContain(1);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('displays correct favorite status', () => {
    favorites.value = [1];
    render(<ShowCard show={mockShow} onClick={mockOnClick} />);
    
    expect(screen.getByTestId('favorite-icon')).toHaveTextContent('Active');
    expect(screen.getByLabelText('Quitar de favoritos')).toBeInTheDocument();
  });

  it('shows expandable summary', () => {
    render(<ShowCard show={mockShow} onClick={mockOnClick} />);
    
    const summaryText = screen.getByText(/Walter White, a struggling high school chemistry teacher/);
    expect(summaryText).toBeInTheDocument();
    
    const expandButton = screen.getByText('Ver más');
    expect(expandButton).toBeInTheDocument();
  });

  it('expands and collapses summary when clicked', () => {
    render(<ShowCard show={mockShow} onClick={mockOnClick} />);
    
    const expandButton = screen.getByText('Ver más');
    fireEvent.click(expandButton);
    
    expect(screen.getByText('Ver menos')).toBeInTheDocument();
    expect(mockOnClick).not.toHaveBeenCalled();
    
    const collapseButton = screen.getByText('Ver menos');
    fireEvent.click(collapseButton);
    
    expect(screen.getByText('Ver más')).toBeInTheDocument();
  });

  it('displays only first 2 genres', () => {
    render(<ShowCard show={mockShow} onClick={mockOnClick} />);
    
    expect(screen.getByText('Drama')).toBeInTheDocument();
    expect(screen.getByText('Crime')).toBeInTheDocument();
    expect(screen.queryByText('Thriller')).not.toBeInTheDocument();
  });

  it('handles show without rating', () => {
    const showWithoutRating = { ...mockShow, rating: { average: null } };
    render(<ShowCard show={showWithoutRating} onClick={mockOnClick} />);
    
    expect(screen.queryByTestId('star-icon')).not.toBeInTheDocument();
  });

  it('displays correct status indicators', () => {
    const runningShow = { ...mockShow, status: 'Running' };
    render(<ShowCard show={runningShow} onClick={mockOnClick} />);
    
    expect(screen.getByText('En emisión')).toBeInTheDocument();
  });

  it('handles show without summary', () => {
    const showWithoutSummary = { ...mockShow, summary: null };
    render(<ShowCard show={showWithoutSummary} onClick={mockOnClick} />);
    
    expect(screen.queryByText('Ver más')).not.toBeInTheDocument();
  });
}); 