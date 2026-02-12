import { json, type RequestHandler } from "@sveltejs/kit";
import { articles } from "../data";

export const GET: RequestHandler = async ({ params }) => {
  const id = parseInt(params.id ?? '0');
  const article = articles.find(a => a.id === id);
  
  if (!article) {
    return json({ message: 'Article not found' }, { status: 404 });
  }
  
  return json(article);
};

export const PUT: RequestHandler = async ({ params, request }) => {
  const id = parseInt(params.id ?? '0');
  const data = await request.json();
  
  const index = articles.findIndex(a => a.id === id);
  
  if (index === -1) {
    return json({ message: 'Article not found' }, { status: 404 });
  }
  
  articles[index] = { ...articles[index], ...data, id };
  
  return json(articles[index]);
};