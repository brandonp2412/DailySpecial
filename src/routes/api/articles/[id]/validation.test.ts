import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, PUT } from './+server';
import { articles } from '../data';

vi.mock('@sveltejs/kit', () => ({
	json: (data: unknown, init?: ResponseInit) =>
		new Response(JSON.stringify(data), {
			status: init?.status || 200,
			headers: { 'Content-Type': 'application/json' }
		})
}));

beforeEach(() => {
	articles.length = 0;
	articles.push({
		id: 1,
		title: 'Article 1',
		author: 'Author 1',
		status: 'draft',
		createdAt: '2024-01-01'
	});
});

describe('article item route validation', () => {
	it.each(['1junk', '1.5', '-1', '0'])(
		'does not treat an invalid route id as an existing article: %s',
		async (id) => {
			const response = await GET({ params: { id } } as any);
			expect(response.status).toBe(404);
		}
	);

	it('does not update an article through a partially numeric route id', async () => {
		const response = await PUT({
			params: { id: '1junk' },
			request: { json: async () => ({ title: 'Wrong article' }) }
		} as any);
		expect(response.status).toBe(404);
		expect(articles[0].title).toBe('Article 1');
	});

	it('returns 400 for malformed JSON without mutating the article', async () => {
		const response = await PUT({
			params: { id: '1' },
			request: { json: async () => Promise.reject(new SyntaxError('bad json')) }
		} as any);
		expect(response.status).toBe(400);
		expect(articles[0].title).toBe('Article 1');
	});

	it.each([
		{ status: 'invalid' },
		{ title: '   ' },
		{ author: null },
		{ createdAt: 'not-a-date' }
	])('rejects invalid update fields: %j', async (body) => {
		const response = await PUT({
			params: { id: '1' },
			request: { json: async () => body }
		} as any);
		expect(response.status).toBe(400);
		expect(articles[0]).toEqual({
			id: 1,
			title: 'Article 1',
			author: 'Author 1',
			status: 'draft',
			createdAt: '2024-01-01'
		});
	});

	it('ignores attempts to add arbitrary fields or replace the id', async () => {
		const response = await PUT({
			params: { id: '1' },
			request: { json: async () => ({ id: 999, unexpected: 'value', title: 'Updated' }) }
		} as any);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			id: 1,
			title: 'Updated',
			author: 'Author 1',
			status: 'draft',
			createdAt: '2024-01-01'
		});
	});
});
