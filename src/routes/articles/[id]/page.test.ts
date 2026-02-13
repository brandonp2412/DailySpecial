import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import ArticleFormPage from './+page.svelte';

// Create a state object that can be mutated
const mockPageState = { params: { id: 'new' } };

// Mock modules - vi.mock is hoisted so we define mocks inline
vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
}));

vi.mock('$app/state', () => ({
  get page() {
    return mockPageState;
  },
}));

// Import the mocked modules
import { goto } from '$app/navigation';

describe('ArticleFormPage - Create Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    
    // Set to create mode
    mockPageState.params.id = 'new';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders create form with correct title', async () => {
    render(ArticleFormPage, {
      props: {
        data: { article: null },
      },
    });

    expect(screen.getByText('Create New Article')).toBeInTheDocument();
    expect(screen.getByText('Write your next masterpiece')).toBeInTheDocument();
  });

  it('renders all form fields', async () => {
    render(ArticleFormPage, {
      props: {
        data: { article: null },
      },
    });

    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Author/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
  });

  it('has default status as draft', async () => {
    render(ArticleFormPage, {
      props: {
        data: { article: null },
      },
    });

    const statusSelect = screen.getByLabelText(/Status/i) as HTMLSelectElement;
    expect(statusSelect.value).toBe('draft');
  });

  it('validates required fields', async () => {
    render(ArticleFormPage, {
      props: {
        data: { article: null },
      },
    });

    const submitButton = screen.getByRole('button', { name: /Create Article/i });
    await fireEvent.click(submitButton);

    // HTML5 validation should prevent submission
    const titleInput = screen.getByLabelText(/Title/i) as HTMLInputElement;
    expect(titleInput.validity.valid).toBe(false);
  });

  it('creates article with valid data', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 123 }),
      })
    ) as any;
    global.fetch = mockFetch;

    render(ArticleFormPage, {
      props: {
        data: { article: null },
      },
    });

    const titleInput = screen.getByPlaceholderText(/Enter article title/i);
    const authorInput = screen.getByPlaceholderText(/Enter author name/i);
    const statusSelect = screen.getByLabelText(/Status/i);

    await fireEvent.input(titleInput, { target: { value: 'Test Article' } });
    await fireEvent.input(authorInput, { target: { value: 'John Doe' } });
    await fireEvent.change(statusSelect, { target: { value: 'published' } });

    const submitButton = screen.getByRole('button', { name: /Create Article/i });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/articles',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Test Article'),
        })
      );
    });

    expect(goto).toHaveBeenCalledWith('/');
  });

  it('displays error message on failed submission', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      })
    ) as any;
    global.fetch = mockFetch;

    render(ArticleFormPage, {
      props: {
        data: { article: null },
      },
    });

    const titleInput = screen.getByPlaceholderText(/Enter article title/i);
    const authorInput = screen.getByPlaceholderText(/Enter author name/i);

    await fireEvent.input(titleInput, { target: { value: 'Test Article' } });
    await fireEvent.input(authorInput, { target: { value: 'John Doe' } });

    const submitButton = screen.getByRole('button', { name: /Create Article/i });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to save article/i)).toBeInTheDocument();
    });
  });

  it('disables submit button while saving', async () => {
    const mockFetch = vi.fn(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ ok: true, json: () => Promise.resolve({}) }), 100)
        )
    ) as any;
    global.fetch = mockFetch;

    render(ArticleFormPage, {
      props: {
        data: { article: null },
      },
    });

    const titleInput = screen.getByPlaceholderText(/Enter article title/i);
    const authorInput = screen.getByPlaceholderText(/Enter author name/i);

    await fireEvent.input(titleInput, { target: { value: 'Test Article' } });
    await fireEvent.input(authorInput, { target: { value: 'John Doe' } });

    const submitButton = screen.getByRole('button', { name: /Create Article/i });
    await fireEvent.click(submitButton);

    expect(screen.getByText(/Saving.../i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(goto).toHaveBeenCalled();
    });
  });

  it('navigates back when cancel button is clicked', async () => {
    render(ArticleFormPage, {
      props: {
        data: { article: null },
      },
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await fireEvent.click(cancelButton);

    expect(goto).toHaveBeenCalledWith('/');
  });

  it('navigates back when back to articles button is clicked', async () => {
    render(ArticleFormPage, {
      props: {
        data: { article: null },
      },
    });

    const backButton = screen.getByRole('button', { name: /Back to Articles/i });
    await fireEvent.click(backButton);

    expect(goto).toHaveBeenCalledWith('/');
  });
});

describe('ArticleFormPage - Edit Mode', () => {
  const mockArticle = {
    id: 123,
    title: 'Existing Article',
    author: 'Jane Smith',
    status: 'published' as const,
    createdAt: '2024-01-15T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();

    // Set to edit mode
    mockPageState.params.id = '123';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders edit form with correct title', async () => {
    render(ArticleFormPage, {
      props: {
        data: { article: mockArticle },
      },
    });

    expect(screen.getByText('Edit Article')).toBeInTheDocument();
    expect(screen.getByText('Make your changes')).toBeInTheDocument();
  });

  it('populates form with existing article data', async () => {
    render(ArticleFormPage, {
      props: {
        data: { article: mockArticle },
      },
    });

    const titleInput = screen.getByDisplayValue('Existing Article');
    const authorInput = screen.getByDisplayValue('Jane Smith');
    const statusSelect = screen.getByLabelText(/Status/i) as HTMLSelectElement;

    expect(titleInput).toBeInTheDocument();
    expect(authorInput).toBeInTheDocument();
    expect(statusSelect.value).toBe('published');
  });

  it('displays creation date in edit mode', async () => {
    render(ArticleFormPage, {
      props: {
        data: { article: mockArticle },
      },
    });

    expect(screen.getByText(/Created 2024-01-15T10:00:00Z/i)).toBeInTheDocument();
  });

  it('updates article with modified data', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 123 }),
      })
    ) as any;
    global.fetch = mockFetch;

    render(ArticleFormPage, {
      props: {
        data: { article: mockArticle },
      },
    });

    const titleInput = screen.getByDisplayValue('Existing Article');
    await fireEvent.input(titleInput, { target: { value: 'Updated Article' } });

    const submitButton = screen.getByRole('button', { name: /Update Article/i });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/articles/123',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Updated Article'),
        })
      );
    });

    expect(goto).toHaveBeenCalledWith('/');
  });

  it('shows correct button text in edit mode', async () => {
    render(ArticleFormPage, {
      props: {
        data: { article: mockArticle },
      },
    });

    expect(screen.getByRole('button', { name: /Update Article/i })).toBeInTheDocument();
  });

  it('allows changing status from published to draft', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    ) as any;
    global.fetch = mockFetch;

    render(ArticleFormPage, {
      props: {
        data: { article: mockArticle },
      },
    });

    const statusSelect = screen.getByLabelText(/Status/i);
    await fireEvent.change(statusSelect, { target: { value: 'draft' } });

    const submitButton = screen.getByRole('button', { name: /Update Article/i });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.status).toBe('draft');
    });
  });
});

describe('ArticleFormPage - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set to create mode
    mockPageState.params.id = 'new';
  });

  it('handles network errors gracefully', async () => {
    const mockFetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
    global.fetch = mockFetch;

    render(ArticleFormPage, {
      props: {
        data: { article: null },
      },
    });

    const titleInput = screen.getByPlaceholderText(/Enter article title/i);
    const authorInput = screen.getByPlaceholderText(/Enter author name/i);

    await fireEvent.input(titleInput, { target: { value: 'Test' } });
    await fireEvent.input(authorInput, { target: { value: 'Author' } });

    const submitButton = screen.getByRole('button', { name: /Create Article/i });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  it('clears error message on subsequent submission', async () => {
    let shouldFail = true;
    const mockFetch = vi.fn(() => {
      if (shouldFail) {
        return Promise.resolve({ ok: false });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as any;
    global.fetch = mockFetch;

    render(ArticleFormPage, {
      props: {
        data: { article: null },
      },
    });

    const titleInput = screen.getByPlaceholderText(/Enter article title/i);
    const authorInput = screen.getByPlaceholderText(/Enter author name/i);

    await fireEvent.input(titleInput, { target: { value: 'Test' } });
    await fireEvent.input(authorInput, { target: { value: 'Author' } });

    const submitButton = screen.getByRole('button', { name: /Create Article/i });
    
    // First submission fails
    await fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/Failed to save article/i)).toBeInTheDocument();
    });

    // Second submission succeeds
    shouldFail = false;
    await fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.queryByText(/Failed to save article/i)).not.toBeInTheDocument();
    });
  });
});