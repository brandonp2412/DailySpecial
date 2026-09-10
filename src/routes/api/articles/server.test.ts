import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, POST } from './+server';
import { articles } from './data';

vi.mock('@sveltejs/kit', () => ({
	json: (data: unknown, init?: ResponseInit) =>
		new Response(JSON.stringify(data), {
			status: init?.status || 200,
			headers: { 'Content-Type': 'application/json' }
		})
}));

describe('POST /api/articles', () => {
	beforeEach(() => {
		articles.length = 0;
		articles.push(
			{ id: 1, title: 'Article 1', author: 'Author 1', status: 'draft', createdAt: '2024-01-01' },
			{
				id: 2,
				title: 'Article 2',
				author: 'Author 2',
				status: 'published',
				createdAt: '2024-01-02'
			},
			{ id: 3, title: 'Article 3', author: 'Author 3', status: 'draft', createdAt: '2024-01-03' }
		);
	});

	it('does not reuse an existing id after an earlier article is deleted', async () => {
		await DELETE({
			request: { json: async () => ({ id: 2 }) }
		} as any);

		await POST({
			request: {
				json: async () => ({
					title: 'New Article',
					author: 'Author 4',
					status: 'draft',
					createdAt: '2024-01-04'
				})
			}
		} as any);

		expect(articles.map((article) => article.id)).toEqual([1, 3, 4]);
	});
});
