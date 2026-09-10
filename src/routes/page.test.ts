import { describe, expect, it, vi } from 'vitest';
import { load } from './+page';

describe('article list loader', () => {
	it('encodes filter values when building the API request', async () => {
		const fetchMock = vi.fn(
			async () =>
				new Response(JSON.stringify({ data: [] }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				})
		);
		const url = new URL('http://localhost/?search=A%26B&status=draft&page=2&limit=25');

		await load({ fetch: fetchMock, url } as any);

		expect(fetchMock).toHaveBeenCalledWith(
			'/api/articles?search=A%26B&status=draft&page=2&limit=25'
		);
	});
});
