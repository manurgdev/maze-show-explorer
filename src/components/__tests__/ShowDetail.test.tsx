import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ShowDetail } from '@/components/ShowDetail';
import { Show } from '@/types/movie';

vi.mock('@/components/Layout/Header', () => ({
  Header: ({ isDetail, onBack, show }: { isDetail?: boolean; onBack?: () => void; show?: Show }) => (
    <div data-testid="header">
      <button onClick={onBack}>Back</button>
      <span>Detail: {isDetail ? 'true' : 'false'}</span>
      <span>Show: {show?.name}</span>
    </div>
  )
}));

vi.mock('@/components/Icons/MovieIcon', () => ({
  MovieIcon: () => <div data-testid="movie-icon">Movie Icon</div>
}));

vi.mock('@/components/Icons/StarIcon', () => ({
  StarIcon: () => <div data-testid="star-icon">Star</div>
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

const mockShowMinimal: Show = {
  id: 2,
  name: 'Minimal Show',
  type: 'Unknown',
  language: 'Unknown',
  genres: [],
  status: 'Unknown',
  runtime: 0,
  averageRuntime: 0,
  premiered: '',
  ended: null,
  officialSite: null,
  schedule: { time: '', days: [] },
  rating: { average: null },
  weight: 0,
  network: null,
  webChannel: null,
  dvdCountry: null,
  externals: { tvrage: null, thetvdb: null, imdb: null },
  image: null,
  summary: null,
  updated: 0,
  _links: { self: { href: '' } }
};

const mockOnBack = vi.fn();

describe('ShowDetail', () => {
  beforeEach(() => {
    mockOnBack.mockClear();
  });

  it('renders show detail with all information', () => {
    render(<ShowDetail show={mockShow} onBack={mockOnBack} />);
    
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    expect(screen.getByText('Drama')).toBeInTheDocument();
    expect(screen.getByText('Crime')).toBeInTheDocument();
    expect(screen.getByText('Thriller')).toBeInTheDocument();
    expect(screen.getByText('Finalizada')).toBeInTheDocument();
    expect(screen.getByText('2008')).toBeInTheDocument();
    expect(screen.getAllByText('Scripted')[0]).toBeInTheDocument();
  });

  it('displays show image when available', () => {
    render(<ShowDetail show={mockShow} onBack={mockOnBack} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockShow.image!.original);
    expect(image).toHaveAttribute('alt', 'Breaking Bad');
  });

  it('shows MovieIcon when image is not available', () => {
    render(<ShowDetail show={mockShowMinimal} onBack={mockOnBack} />);
    
    expect(screen.getByTestId('movie-icon')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('displays rating when available', () => {
    render(<ShowDetail show={mockShow} onBack={mockOnBack} />);
    
    expect(screen.getByText('9.5')).toBeInTheDocument();
    expect(screen.getByText('/10')).toBeInTheDocument();
    expect(screen.getByTestId('star-icon')).toBeInTheDocument();
  });

  it('hides rating section when not available', () => {
    render(<ShowDetail show={mockShowMinimal} onBack={mockOnBack} />);
    
    expect(screen.queryByTestId('star-icon')).not.toBeInTheDocument();
  });

  it('displays clean summary text', () => {
    render(<ShowDetail show={mockShow} onBack={mockOnBack} />);
    
    expect(screen.getByText(/Walter White, a struggling high school chemistry teacher/)).toBeInTheDocument();
    expect(screen.queryByText('<p>')).not.toBeInTheDocument();
  });

  it('shows default summary when not available', () => {
    render(<ShowDetail show={mockShowMinimal} onBack={mockOnBack} />);
    
    expect(screen.getByText('Sin descripción disponible')).toBeInTheDocument();
  });

  it('displays general information correctly', () => {
    render(<ShowDetail show={mockShow} onBack={mockOnBack} />);
    
    expect(screen.getAllByText('Scripted')[0]).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('20/1/2008')).toBeInTheDocument();
    expect(screen.getByText('29/9/2013')).toBeInTheDocument();
  });

  it('displays schedule information correctly', () => {
    render(<ShowDetail show={mockShow} onBack={mockOnBack} />);
    
    expect(screen.getByText('47 min')).toBeInTheDocument();
    expect(screen.getByText('Sunday')).toBeInTheDocument();
    expect(screen.getByText('21:00')).toBeInTheDocument();
    expect(screen.getByText('AMC')).toBeInTheDocument();
  });

  it('handles missing schedule information', () => {
    render(<ShowDetail show={mockShowMinimal} onBack={mockOnBack} />);
    
    expect(screen.getAllByText('N/A').length).toBeGreaterThanOrEqual(3);
  });

  it('displays external links when available', () => {
    render(<ShowDetail show={mockShow} onBack={mockOnBack} />);
    
    const officialSiteLink = screen.getByText('Sitio Oficial');
    expect(officialSiteLink).toHaveAttribute('href', 'http://www.amc.com/shows/breaking-bad');
    expect(officialSiteLink).toHaveAttribute('target', '_blank');
    
    const imdbLink = screen.getByText('Ver en IMDb');
    expect(imdbLink).toHaveAttribute('href', 'https://www.imdb.com/title/tt0903747');
    expect(imdbLink).toHaveAttribute('target', '_blank');
  });

  it('hides external links when not available', () => {
    render(<ShowDetail show={mockShowMinimal} onBack={mockOnBack} />);
    
    expect(screen.queryByText('Sitio Oficial')).not.toBeInTheDocument();
    expect(screen.queryByText('Ver en IMDb')).not.toBeInTheDocument();
  });

  it('calls onBack when back button is clicked through Header', () => {
    render(<ShowDetail show={mockShow} onBack={mockOnBack} />);
    
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('renders Header with correct props', () => {
    render(<ShowDetail show={mockShow} onBack={mockOnBack} />);
    
    expect(screen.getByText('Detail: true')).toBeInTheDocument();
    expect(screen.getByText('Show: Breaking Bad')).toBeInTheDocument();
  });

  it('formats days correctly', () => {
    const showMultipleDays = {
      ...mockShow,
      schedule: { time: '20:00', days: ['Monday', 'Tuesday', 'Wednesday'] }
    };
    
    render(<ShowDetail show={showMultipleDays} onBack={mockOnBack} />);
    
    expect(screen.getByText('Monday, Tuesday, Wednesday')).toBeInTheDocument();
  });

  it('displays correct status indicators', () => {
    const runningShow = { ...mockShow, status: 'Running' };
    render(<ShowDetail show={runningShow} onBack={mockOnBack} />);
    
    expect(screen.getByText('En emisión')).toBeInTheDocument();
  });

  it('uses medium image as fallback when original is not available', () => {
    const showWithMediumOnly = {
      ...mockShow,
      image: { medium: 'medium.jpg', original: '' }
    };
    
    render(<ShowDetail show={showWithMediumOnly} onBack={mockOnBack} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'medium.jpg');
  });
}); 