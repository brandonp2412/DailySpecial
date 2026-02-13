/* eslint-disable @typescript-eslint/no-empty-function */
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect, vi } from 'vitest';
import { readable } from 'svelte/store';

// Add custom jest-dom matchers
expect.extend(matchers);

// Mock SvelteKit runtime module $app/environment
vi.mock('$app/environment', () => ({
  browser: false,
  dev: true,
  building: false,
  version: 'any',
}));

// Mock SvelteKit runtime module $app/navigation
vi.mock('$app/navigation', () => ({
  afterNavigate: vi.fn(),
  beforeNavigate: vi.fn(),
  disableScrollHandling: vi.fn(),
  goto: vi.fn(() => Promise.resolve()),
  invalidate: vi.fn(() => Promise.resolve()),
  invalidateAll: vi.fn(() => Promise.resolve()),
  preloadData: vi.fn(() => Promise.resolve({ type: 'loaded', status: 200, data: {} })),
  preloadCode: vi.fn(() => Promise.resolve()),
  pushState: vi.fn(),
  replaceState: vi.fn(),
  onNavigate: vi.fn(),
}));

// Mock SvelteKit runtime module $app/stores
vi.mock('$app/stores', () => {
  const navigating = readable(null);
  const page = readable({
    url: new URL('http://localhost'),
    params: {},
    route: {
      id: null,
    },
    status: 200,
    error: null,
    data: {},
    state: {},
    form: undefined,
  });
  const updated = {
    subscribe: readable(false).subscribe,
    check: async () => false,
  };

  return {
    navigating: {
      subscribe: navigating.subscribe,
    },
    page: {
      subscribe: page.subscribe,
    },
    updated: {
      subscribe: updated.subscribe,
      check: updated.check,
    },
    getStores: () => ({ navigating, page, updated }),
  };
});