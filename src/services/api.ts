import { type Show } from '@/types/movie';

const BASE_URL = 'https://api.tvmaze.com';

export const fetchShows = async (page: number = 0): Promise<Show[]> => {
  try {
    const response = await fetch(`${BASE_URL}/shows?page=${page}`);
    if (!response.ok) {
      throw new Error(`Error fetching shows: ${response.statusText}`);
    }
    const data: Show[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching shows:', error);
    throw error;
  }
};
