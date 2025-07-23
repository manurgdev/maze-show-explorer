import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchShows } from '@/services/api';
import { Show } from '@/types/movie';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

const mockShowData: Show[] = [
  {
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
    summary: '<p><b>Breaking Bad</b> is an American crime drama television series.</p>',
    updated: 1704794301,
    _links: {
      self: {
        href: 'https://api.tvmaze.com/shows/1'
      }
    }
  },
  {
    id: 2,
    name: 'Better Call Saul',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama', 'Crime'],
    status: 'Ended',
    runtime: 47,
    averageRuntime: 47,
    premiered: '2015-02-08',
    ended: '2022-08-15',
    officialSite: 'http://www.amc.com/shows/better-call-saul',
    schedule: {
      time: '21:00',
      days: ['Monday']
    },
    rating: {
      average: 8.8
    },
    weight: 94,
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
      tvrage: 37780,
      thetvdb: 273181,
      imdb: 'tt3110726'
    },
    image: {
      medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/34/85810.jpg',
      original: 'https://static.tvmaze.com/uploads/images/original_untouched/34/85810.jpg'
    },
    summary: '<p><b>Better Call Saul</b> is a prequel to Breaking Bad.</p>',
    updated: 1704794301,
    _links: {
      self: {
        href: 'https://api.tvmaze.com/shows/2'
      }
    }
  }
];

describe('api.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();
  });

  describe('fetchShows', () => {
    it('successfully fetches shows with default page (0)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockShowData,
      });

      const result = await fetchShows();

      expect(mockFetch).toHaveBeenCalledWith('https://api.tvmaze.com/shows?page=0');
      expect(result).toEqual(mockShowData);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Breaking Bad');
    });

    it('successfully fetches shows with specific page number', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockShowData,
      });

      const result = await fetchShows(5);

      expect(mockFetch).toHaveBeenCalledWith('https://api.tvmaze.com/shows?page=5');
      expect(result).toEqual(mockShowData);
    });

    it('handles empty response successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await fetchShows(999);

      expect(mockFetch).toHaveBeenCalledWith('https://api.tvmaze.com/shows?page=999');
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('throws error when response is not ok (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(fetchShows(1000)).rejects.toThrow('Error fetching shows: Not Found');
      expect(mockFetch).toHaveBeenCalledWith('https://api.tvmaze.com/shows?page=1000');
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
    });

    it('throws error when response is not ok (500)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(fetchShows()).rejects.toThrow('Error fetching shows: Internal Server Error');
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
    });

    it('throws error when network request fails', async () => {
      const networkError = new Error('Network Error');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(fetchShows()).rejects.toThrow('Network Error');
      expect(mockFetch).toHaveBeenCalledWith('https://api.tvmaze.com/shows?page=0');
      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching shows:', networkError);
    });

    it('throws error when JSON parsing fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(fetchShows()).rejects.toThrow('Invalid JSON');
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
    });

    it('handles fetch timeout/abort error', async () => {
      const abortError = new Error('The user aborted a request');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      await expect(fetchShows()).rejects.toThrow('The user aborted a request');
      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching shows:', abortError);
    });

    it('validates response data structure', async () => {
      const validShow = mockShowData[0];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [validShow],
      });

      const result = await fetchShows();

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('genres');
      expect(result[0]).toHaveProperty('status');
      expect(typeof result[0].id).toBe('number');
      expect(typeof result[0].name).toBe('string');
    });

    it('constructs correct URL for different page numbers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await fetchShows(0);
      expect(mockFetch).toHaveBeenLastCalledWith('https://api.tvmaze.com/shows?page=0');

      await fetchShows(10);
      expect(mockFetch).toHaveBeenLastCalledWith('https://api.tvmaze.com/shows?page=10');

      await fetchShows(300);
      expect(mockFetch).toHaveBeenLastCalledWith('https://api.tvmaze.com/shows?page=300');
    });

    it('preserves error context when re-throwing', async () => {
      const originalError = new Error('Connection refused');
      mockFetch.mockRejectedValueOnce(originalError);

      try {
        await fetchShows();
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBe(originalError);
        expect(mockConsoleError).toHaveBeenCalledWith('Error fetching shows:', originalError);
      }
    });
  });
}); 