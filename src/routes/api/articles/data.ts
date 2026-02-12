import type { Article } from "./article.model";

export let articles: Article[] = [
  { id: 1, title: 'First Article', status: 'published', content: 'This is the first article.' },
  { id: 2, title: 'Second Article', status: 'draft', content: 'This is the second article.' },
  { id: 3, title: 'Third Article', status: 'published', content: 'This is the third article.' }
];
