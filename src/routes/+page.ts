import type { PageLoad } from './$types';
import type { Article } from './api/articles/article.model';

export const load: PageLoad = async ({ fetch, url }) => {
	const params = new URLSearchParams({
		search: url.searchParams.get('search') || '',
		status: url.searchParams.get('status') || '',
		page: url.searchParams.get('page') || '1',
		limit: url.searchParams.get('limit') || '10'
	});

	const response = await fetch(`/api/articles?${params.toString()}`);
	if (!response.ok) {
		throw new Error(`Failed to load articles: HTTP ${response.status}`);
	}
	const json = await response.json();

	return {
		articles: json.data as Article[]
	};
};
