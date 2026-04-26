import { GNewsResponse } from '@/types';

const GNEWS_BASE_URL = 'https://gnews.io/api/v4';

/** Fetch top headlines from GNews API for a country */
export async function fetchTopHeadlines(countryCode: string): Promise<GNewsResponse> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    return { totalArticles: 0, articles: [] };
  }

  const url = `${GNEWS_BASE_URL}/top-headlines?country=${countryCode.toLowerCase()}&max=10&apikey=${apiKey}`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!response.ok) {
      console.error(`GNews API error: ${response.status} ${response.statusText}`);
      return { totalArticles: 0, articles: [] };
    }
    return await response.json();
  } catch (error) {
    console.error('GNews fetch error:', error);
    return { totalArticles: 0, articles: [] };
  }
}

/** Search GNews for articles about a specific topic */
export async function searchNews(query: string, lang: string = 'en'): Promise<GNewsResponse> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    return { totalArticles: 0, articles: [] };
  }

  const url = `${GNEWS_BASE_URL}/search?q=${encodeURIComponent(query)}&lang=${lang}&max=5&apikey=${apiKey}`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      console.error(`GNews search error: ${response.status} ${response.statusText}`);
      return { totalArticles: 0, articles: [] };
    }
    return await response.json();
  } catch (error) {
    console.error('GNews search error:', error);
    return { totalArticles: 0, articles: [] };
  }
}
