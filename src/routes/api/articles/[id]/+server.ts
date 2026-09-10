import { json, type RequestHandler } from '@sveltejs/kit';
import { articles } from '../data';

function articleId(value: string | undefined): number | null {
	if (!value || !/^\d+$/.test(value)) return null;
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

export const GET: RequestHandler = async ({ params }) => {
	const id = articleId(params.id);
	const article = id === null ? undefined : articles.find((a) => a.id === id);

	if (!article) {
		return json({ message: 'Article not found' }, { status: 404 });
	}

	return json(article);
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const id = articleId(params.id);
	const index = id === null ? -1 : articles.findIndex((a) => a.id === id);

	if (index === -1 || id === null) {
		return json({ message: 'Article not found' }, { status: 404 });
	}

	const data = await jsonObject(request);
	if (data === null) {
		return json({ message: 'Request body must be a JSON object' }, { status: 400 });
	}

	const updated = { ...articles[index] };
	if ('title' in data) {
		if (typeof data.title !== 'string' || !data.title.trim()) {
			return json({ message: 'Invalid title' }, { status: 400 });
		}
		updated.title = data.title.trim();
	}
	if ('author' in data) {
		if (typeof data.author !== 'string' || !data.author.trim()) {
			return json({ message: 'Invalid author' }, { status: 400 });
		}
		updated.author = data.author.trim();
	}
	if ('status' in data) {
		if (data.status !== 'draft' && data.status !== 'published') {
			return json({ message: 'Invalid status' }, { status: 400 });
		}
		updated.status = data.status;
	}
	if ('createdAt' in data) {
		if (typeof data.createdAt !== 'string' || Number.isNaN(Date.parse(data.createdAt))) {
			return json({ message: 'Invalid createdAt' }, { status: 400 });
		}
		updated.createdAt = data.createdAt;
	}

	articles[index] = { ...updated, id };
	return json(articles[index]);
};
