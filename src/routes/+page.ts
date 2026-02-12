import type { PageLoad } from './$types';
import type { Article } from './api/articles/article.model';

export const load: PageLoad = async ({ fetch, url }) => {
  const search = url.searchParams.get('search') || '';
  const status = url.searchParams.get('status') || '';
  const page = url.searchParams.get('page') || '1';
  const limit = url.searchParams.get('limit') || '10';
  
  const response = await fetch(`/api/articles?search=${search}&status=${status}&page=${page}&limit=${limit}`);
  const json = await response.json();
  
  return {
    articles: json.data as Article[],
  };
};