import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, PUT } from './+server';
import { articles } from '../data';

// Mock @sveltejs/kit
vi.mock('@sveltejs/kit', () => ({
  json: (data: any, init?: ResponseInit) => {
    return new Response(JSON.stringify(data), {
      status: init?.status || 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
}));

describe('GET /api/articles/[id]', () => {
  beforeEach(() => {
    // Reset articles to a known state before each test
    articles.length = 0;
    articles.push(
      { id: 1, title: 'Article 1', author: 'Author 1', status: 'draft', createdAt: '2024-01-01' },
      { id: 2, title: 'Article 2', author: 'Author 2', status: 'published', createdAt: '2024-01-02' },
      { id: 3, title: 'Article 3', author: 'Author 3', status: 'draft', createdAt: '2024-01-03' }
    );
  });

  it('returns article when valid id is provided', async () => {
    const response = await GET({
      params: { id: '2' },
    } as any);

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toEqual({
      id: 2,
      title: 'Article 2',
      author: 'Author 2',
      status: 'published',
      createdAt: '2024-01-02',
    });
  });

  it('returns 404 when article is not found', async () => {
    const response = await GET({
      params: { id: '999' },
    } as any);

    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data).toEqual({ message: 'Article not found' });
  });

  it('handles missing id param by defaulting to 0', async () => {
    const response = await GET({
      params: {},
    } as any);

    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data).toEqual({ message: 'Article not found' });
  });

  it('handles undefined id param by defaulting to 0', async () => {
    const response = await GET({
      params: { id: undefined },
    } as any);

    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data).toEqual({ message: 'Article not found' });
  });

  it('returns first article when id is 1', async () => {
    const response = await GET({
      params: { id: '1' },
    } as any);

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.id).toBe(1);
    expect(data.title).toBe('Article 1');
  });

  it('handles string id that cannot be parsed as number', async () => {
    const response = await GET({
      params: { id: 'invalid' },
    } as any);

    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data).toEqual({ message: 'Article not found' });
  });
});

describe('PUT /api/articles/[id]', () => {
  beforeEach(() => {
    // Reset articles to a known state before each test
    articles.length = 0;
    articles.push(
      { id: 1, title: 'Article 1', author: 'Author 1', status: 'draft', createdAt: '2024-01-01' },
      { id: 2, title: 'Article 2', author: 'Author 2', status: 'published', createdAt: '2024-01-02' },
      { id: 3, title: 'Article 3', author: 'Author 3', status: 'draft', createdAt: '2024-01-03' }
    );
  });

  it('updates article with valid data', async () => {
    const updateData = {
      title: 'Updated Article 2',
      author: 'Updated Author',
      status: 'draft',
    };

    const response = await PUT({
      params: { id: '2' },
      request: {
        json: async () => updateData,
      },
    } as any);

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toEqual({
      id: 2,
      title: 'Updated Article 2',
      author: 'Updated Author',
      status: 'draft',
      createdAt: '2024-01-02',
    });

    // Verify the article was actually updated in the array
    const updatedArticle = articles.find(a => a.id === 2);
    expect(updatedArticle?.title).toBe('Updated Article 2');
    expect(updatedArticle?.author).toBe('Updated Author');
  });

  it('partially updates article (only title)', async () => {
    const updateData = {
      title: 'New Title Only',
    };

    const response = await PUT({
      params: { id: '1' },
      request: {
        json: async () => updateData,
      },
    } as any);

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.title).toBe('New Title Only');
    expect(data.author).toBe('Author 1'); // Should keep original author
    expect(data.status).toBe('draft'); // Should keep original status
  });

  it('preserves the original id even if provided in update data', async () => {
    const updateData = {
      id: 999, // Try to change the ID
      title: 'Hacked Title',
    };

    const response = await PUT({
      params: { id: '2' },
      request: {
        json: async () => updateData,
      },
    } as any);

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.id).toBe(2); // Should keep the original ID from params
    expect(data.title).toBe('Hacked Title');
  });

  it('returns 404 when trying to update non-existent article', async () => {
    const updateData = {
      title: 'This should fail',
    };

    const response = await PUT({
      params: { id: '999' },
      request: {
        json: async () => updateData,
      },
    } as any);

    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data).toEqual({ message: 'Article not found' });
  });

  it('handles missing id param by defaulting to 0', async () => {
    const updateData = {
      title: 'Updated Title',
    };

    const response = await PUT({
      params: {},
      request: {
        json: async () => updateData,
      },
    } as any);

    expect(response.status).toBe(404);
  });

  it('updates article status from draft to published', async () => {
    const updateData = {
      status: 'published',
    };

    const response = await PUT({
      params: { id: '1' },
      request: {
        json: async () => updateData,
      },
    } as any);

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('published');
    expect(data.id).toBe(1);
  });

  it('updates article status from published to draft', async () => {
    const updateData = {
      status: 'draft',
    };

    const response = await PUT({
      params: { id: '2' },
      request: {
        json: async () => updateData,
      },
    } as any);

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('draft');
    expect(data.id).toBe(2);
  });

  it('updates multiple fields at once', async () => {
    const updateData = {
      title: 'Completely New Title',
      author: 'Completely New Author',
      status: 'published',
      createdAt: '2024-02-15',
    };

    const response = await PUT({
      params: { id: '3' },
      request: {
        json: async () => updateData,
      },
    } as any);

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toEqual({
      id: 3,
      title: 'Completely New Title',
      author: 'Completely New Author',
      status: 'published',
      createdAt: '2024-02-15',
    });
  });

  it('handles empty update object', async () => {
    const updateData = {};

    const response = await PUT({
      params: { id: '1' },
      request: {
        json: async () => updateData,
      },
    } as any);

    expect(response.status).toBe(200);
    
    const data = await response.json();
    // Should return the original article unchanged
    expect(data).toEqual({
      id: 1,
      title: 'Article 1',
      author: 'Author 1',
      status: 'draft',
      createdAt: '2024-01-01',
    });
  });

  it('updates the correct article in the array', async () => {
    const updateData = {
      title: 'Middle Article Updated',
    };

    await PUT({
      params: { id: '2' },
      request: {
        json: async () => updateData,
      },
    } as any);

    // Check that only article 2 was updated
    expect(articles[0].title).toBe('Article 1'); // Unchanged
    expect(articles[1].title).toBe('Middle Article Updated'); // Changed
    expect(articles[2].title).toBe('Article 3'); // Unchanged
  });

  it('handles string id that cannot be parsed as number', async () => {
    const updateData = {
      title: 'This should fail',
    };

    const response = await PUT({
      params: { id: 'invalid' },
      request: {
        json: async () => updateData,
      },
    } as any);

    expect(response.status).toBe(404);
  });
});