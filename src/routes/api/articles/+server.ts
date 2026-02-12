import { json, type RequestHandler } from "@sveltejs/kit";
import type { Article } from "./article.model";
import { articles } from "./data";

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
  
  if (!data.title || !data.status || !data.author) {
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

  const index = articles.findIndex(article => article.id === data.id);
  if (index !== -1) {
    articles.splice(index, 1);
  }

  return json({ message: 'Article removed successfully' });
};