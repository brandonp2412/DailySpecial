import { json, type RequestHandler } from '@sveltejs/kit';
import { articles } from './data';

function positiveInteger(value: string | null, fallback: number): number | null {
	if (value === null || value === '') return fallback;
	if (!/^\d+$/.test(value)) return null;

	const parsed = Number(value);
	return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

async function jsonObject(request: Request): Promise<Record<string, unknown> | null> {
	try {
		const data: unknown = await request.json();
		if (typeof data !== 'object' || data === null || Array.isArray(data)) return null;
		return data as Record<string, unknown>;
	} catch {
		return null;
	}
}

export const GET: RequestHandler = async ({ url }) => {
	const search = url.searchParams.get('search') || '';
	const status = url.searchParams.get('status') || '';
	const page = positiveInteger(url.searchParams.get('page'), 1);
	const limit = positiveInteger(url.searchParams.get('limit'), 10);

	if (page === null || limit === null) {
		return json({ message: 'page and limit must be positive integers' }, { status: 400 });
	}

	const filtered = articles.filter((article) => {
		const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase());
		const matchesStatus = status ? article.status === status : true;
		return matchesSearch && matchesStatus;
	});

	const sliced = filtered.slice((page - 1) * limit, page * limit);
	return json({ data: sliced });
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await jsonObject(request);
	if (data === null) {
		return json({ message: 'Request body must be a JSON object' }, { status: 400 });
	}

	const title = typeof data.title === 'string' ? data.title.trim() : '';
	const author = typeof data.author === 'string' ? data.author.trim() : '';
	const status = data.status === 'draft' || data.status === 'published' ? data.status : null;
	const createdAt = typeof data.createdAt === 'string' ? data.createdAt : '';

	if (!title || !author || status === null || !createdAt || Number.isNaN(Date.parse(createdAt))) {
		return json({ message: 'Missing or invalid required fields' }, { status: 400 });
	}

	const nextId = articles.reduce((maxId, article) => Math.max(maxId, article.id), 0) + 1;
	articles.push({ id: nextId, title, author, status, createdAt });

	return json({ message: 'Article added successfully' });
};

export const DELETE: RequestHandler = async ({ request }) => {
	const data = await jsonObject(request);
	if (data === null) {
		return json({ message: 'Request body must be a JSON object' }, { status: 400 });
	}

	const rawId = data.id;
	const id = typeof rawId === 'number' || typeof rawId === 'string' ? Number(rawId) : Number.NaN;

	if (!Number.isSafeInteger(id) || id <= 0) {
		return json({ message: 'A positive integer id is required' }, { status: 400 });
	}

	const index = articles.findIndex((article) => article.id === id);
	if (index === -1) {
		return json({ message: 'Article not found' }, { status: 404 });
	}

	articles.splice(index, 1);
	return json({ message: 'Article removed successfully' });
};
