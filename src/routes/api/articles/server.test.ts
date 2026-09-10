import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, GET, POST } from './+server';
import { articles } from './data';

vi.mock('@sveltejs/kit', () => ({
	json: (data: unknown, init?: ResponseInit) =>
		new Response(JSON.stringify(data), {
			status: init?.status || 200,
			headers: { 'Content-Type': 'application/json' }
		})
}));

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

describe('GET /api/articles', () => {
	const url = (query = '') => new URL(`https://example.test/api/articles${query}`);

	it.each(['?page=0', '?page=-1', '?page=nope', '?page=2abc', '?limit=0', '?limit=-2', '?limit=1.5'])(
		'rejects invalid pagination: %s',
		async (query) => {
			const response = await GET({ url: url(query) } as any);
			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({
				message: 'page and limit must be positive integers'
			});
		}
	);

	it('still paginates valid requests', async () => {
		const response = await GET({ url: url('?page=2&limit=1') } as any);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ data: [articles[1]] });
	});
});

describe('POST /api/articles', () => {
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

	it('returns 400 when the request body is malformed JSON', async () => {
		const response = await POST({
			request: { json: async () => Promise.reject(new SyntaxError('bad json')) }
		} as any);
		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ message: 'Request body must be a JSON object' });
		expect(articles).toHaveLength(3);
	});

	it.each([
		null,
		[],
		{ title: 'New Article', author: 'Author 4', status: 'invalid', createdAt: '2024-01-04' },
		{ title: 'New Article', author: 'Author 4', status: 'draft', createdAt: '' },
		{ title: '   ', author: 'Author 4', status: 'draft', createdAt: '2024-01-04' }
	])('rejects invalid article bodies: %j', async (body) => {
		const response = await POST({
			request: { json: async () => body }
		} as any);
		expect(response.status).toBe(400);
		expect(articles).toHaveLength(3);
	});
});

describe('DELETE /api/articles', () => {
	it('returns 404 instead of reporting success for an unknown article', async () => {
		const response = await DELETE({
			request: { json: async () => ({ id: 999 }) }
		} as any);
		expect(response.status).toBe(404);
		expect(articles).toHaveLength(3);
	});

	it('accepts a numeric JSON string id and deletes the matching article', async () => {
		const response = await DELETE({
			request: { json: async () => ({ id: '2' }) }
		} as any);
		expect(response.status).toBe(200);
		expect(articles.map((article) => article.id)).toEqual([1, 3]);
	});

	it('returns 400 when the request body is malformed JSON', async () => {
		const response = await DELETE({
			request: { json: async () => Promise.reject(new SyntaxError('bad json')) }
		} as any);
		expect(response.status).toBe(400);
		expect(articles).toHaveLength(3);
	});

	it.each([{}, null, [], { id: 0 }, { id: -1 }, { id: 'abc' }, { id: 1.5 }, { id: true }])(
		'rejects an invalid id: %j',
		async (body) => {
			const response = await DELETE({
				request: { json: async () => body }
			} as any);
			expect(response.status).toBe(400);
			expect(articles).toHaveLength(3);
		}
	);
});
