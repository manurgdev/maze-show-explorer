import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '@/App';
import { isInfiniteScroll, selectedShow, shows } from '@/store/signals';
import { Show } from '@/types/movie';

const mockScrollTo = vi.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true
});

vi.mock('@/components/ShowList', () => ({
  ShowList: ({ onShowClick }: { onShowClick: (show: Show) => void }) => (
    <div data-testid="show-list">
      <button onClick={() => onShowClick(mockShow)}>Test Show</button>
    </div>
  )
}));

vi.mock('@/components/ShowListInfinite', () => ({
  ShowListInfinite: ({ onShowClick }: { onShowClick: (show: Show) => void }) => (
    <div data-testid="show-list-infinite">
      <button onClick={() => onShowClick(mockShow)}>Test Show Infinite</button>
    </div>
  )
}));

vi.mock('@/components/ShowDetail', () => ({
  ShowDetail: ({ show, onBack }: { show: Show; onBack: () => void }) => (
    <div data-testid="show-detail">
      <h1>{show.name}</h1>
      <button onClick={onBack}>Back</button>
    </div>
  )
}));

vi.mock('@/components/Layout/Header', () => ({
  Header: ({ onToggleMode }: { onToggleMode?: () => void }) => (
    <div data-testid="header">
      <button onClick={onToggleMode}>Toggle Mode</button>
    </div>
  )
}));

const mockShow: Show = {
  id: 1,
  name: 'Test Show',
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
  image: { medium: 'test.jpg', original: 'test-large.jpg' },
  summary: 'Test summary',
  updated: 1234567890,
  _links: { self: { href: 'test' } }
};

describe('App', () => {
  beforeEach(() => {
    selectedShow.value = null;
    isInfiniteScroll.value = false;
    shows.value = [];
    mockScrollTo.mockClear();
  });

  it('renders the main layout with header and show list', () => {
    render(<App />);
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('show-list')).toBeInTheDocument();
  });

  it('renders infinite scroll list when isInfiniteScroll is true', () => {
    isInfiniteScroll.value = true;
    render(<App />);
    
    expect(screen.getByTestId('show-list-infinite')).toBeInTheDocument();
    expect(screen.queryByTestId('show-list')).not.toBeInTheDocument();
  });

  it('navigates to show detail when clicking on a show', async () => {
    render(<App />);
    
    const showButton = screen.getByText('Test Show');
    fireEvent.click(showButton);

    await waitFor(() => {
      expect(screen.getByTestId('show-detail')).toBeInTheDocument();
      expect(screen.getByText('Test Show')).toBeInTheDocument();
    });

    expect(mockScrollTo).toHaveBeenCalledWith({ top: 0 });
  });

  it('navigates back to list from show detail', async () => {
    selectedShow.value = mockShow;
    render(<App />);
    
    expect(screen.getByTestId('show-detail')).toBeInTheDocument();
    
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByTestId('show-list')).toBeInTheDocument();
      expect(screen.queryByTestId('show-detail')).not.toBeInTheDocument();
    });
  });

  it('redirects unknown routes to home', () => {
    render(<App />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });
}); 