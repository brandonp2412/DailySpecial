import { json, type RequestHandler } from "@sveltejs/kit";
import type { Article } from "./article.model";

let articles: Article[] = [
  { id: 1, title: 'First Article', status: 'published', content: 'This is the first article.' },
  { id: 2, title: 'Second Article', status: 'draft', content: 'This is the second article.' },
  { id: 3, title: 'Third Article', status: 'published', content: 'This is the third article.' }
];

export const GET: RequestHandler = async ({ url }) => {
  const search = url.searchParams.get('search') || '';
  const status = url.searchParams.get('status') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');

  const filtered = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status ? article.status === status : true;
    return matchesSearch && matchesStatus;
  });
  
  const sliced = filtered.slice((page - 1) * limit, page * limit);
  return json({ data: sliced });
};

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();
  
  if (!data.title || !data.status || !data.content) {
    return json({ message: 'Missing required fields' }, { status: 400 });
  }

  articles.push({...data, id: articles.length + 1 });

  return json({ message: 'Article added successfully' });
};

export const DELETE: RequestHandler = async ({ request }) => {
  const data = await request.json();
  
  if (!data.id) {
    return json({ message: 'Missing required fields' }, { status: 400 });
  }

  articles = articles.filter(article => article.id !== data.id);

  return json({ message: 'Article removed successfully' });
};