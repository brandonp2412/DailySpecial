import type { Article } from "./article.model";

export let articles: Article[] = [
  { id: 1, title: 'First Article', status: 'published', author: 'Brandon Dick', createdAt: new Date().toISOString() },
  { id: 2, title: 'Second Article', status: 'draft', author: 'Brandon Dick', createdAt: new Date().toISOString() },
  { id: 3, title: 'Third Article', status: 'published', author: 'Brandon Dick', createdAt: new Date().toISOString() }
];
