import type { Article } from '../../api/articles/article.model';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	if (params.id === 'new') {
		return {
			article: null
		};
	}
	
	const response = await fetch(`/api/articles/${params.id}`);
	const article = await response.json();
	
	return {
		article: article as Article
	};
};