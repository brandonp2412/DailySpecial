<script lang="ts">
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';

	let { data }: { data: PageData } = $props();

	let limit = $state(Number(page.url.searchParams.get('limit')) || 10);
	let currentPage = $state(Number(page.url.searchParams.get('page')) || 1);
	let search = $state(page.url.searchParams.get('search') || '');
	let status = $state(page.url.searchParams.get('status') || '');

	function updateParams(newPage: number, newLimit: number) {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('page', newPage.toString());
		params.set('limit', newLimit.toString());
		params.set('search', search);
		params.set('status', status);
		goto(`?${params.toString()}`, { keepFocus: true });
	}

	function refresh() {
		currentPage = 1;
		updateParams(currentPage, limit);
	}
</script>

<div class="container">
	<header>
		<h1>Articles</h1>
		<button class="btn-primary" onclick={() => goto('/articles/new')}>
			<span>+</span> Add Article
		</button>
	</header>

	<div class="filters">
		<label class="filter-item">
			<span class="label-text">Search</span>
			<input type="text" placeholder="Search articles..." bind:value={search} onchange={refresh} />
		</label>
		<label class="filter-item">
			<span class="label-text">Status</span>
			<select onchange={refresh} bind:value={status}>
				<option value="">All</option>
				<option value="published">Published</option>
				<option value="draft">Draft</option>
			</select>
		</label>
	</div>

	<div class="articles-list">
		{#each data.articles as article}
			<div class="article-card">
				<div class="article-content">
					<h3>{article.title}</h3>
					{#if article.status}
						<span class="status-badge status-{article.status}">{article.status}</span>
					{/if}
				</div>
				<div class="article-actions">
					<button class="btn-secondary" onclick={() => goto(`/articles/${article.id}`)}>
						Edit
					</button>
					<button
						class="btn-danger"
						onclick={async () => {
							const ok = confirm(`Are you sure you want to delete "${article.title}"?`);
							if (ok) {
								await fetch(`/api/articles`, {
									method: 'DELETE',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({ id: article.id })
								});
								await invalidateAll();
							}
						}}
					>
						Delete
					</button>
				</div>
			</div>
		{/each}
	</div>

	<div class="pagination">
		<div class="pagination-controls">
			<button
				class="btn-icon"
				onclick={() => {
					currentPage--;
					updateParams(currentPage, limit);
				}}
				disabled={currentPage <= 1}
			>
				← Prev
			</button>
			<span class="page-info">Page {currentPage}</span>
			<button
				class="btn-icon"
				onclick={() => {
					currentPage++;
					updateParams(currentPage, limit);
				}}
			>
				Next →
			</button>
		</div>
		<label class="limit-control">
			<span class="label-text">Items per page</span>
			<input type="number" min="1" max="100" bind:value={limit} onchange={refresh} />
		</label>
	</div>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		background: white;
		padding: 2rem;
		border-radius: 16px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	h1 {
		margin: 0;
		font-size: 2.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.filters {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
		background: white;
		padding: 1.5rem;
		border-radius: 16px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.filter-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.label-text {
		font-size: 0.875rem;
		font-weight: 600;
		color: #4a5568;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	input[type='text'],
	input[type='number'],
	select {
		padding: 0.75rem 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		font-size: 1rem;
		transition: all 0.2s;
		background: white;
	}

	input[type='text']:focus,
	input[type='number']:focus,
	select:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.articles-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.article-card {
		background: white;
		padding: 1.5rem;
		border-radius: 12px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: all 0.3s;
	}

	.article-card:hover {
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}

	.article-content {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.article-content h3 {
		margin: 0;
		font-size: 1.25rem;
		color: #2d3748;
	}

	.status-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.status-published {
		background: #d4edda;
		color: #155724;
	}

	.status-draft {
		background: #fff3cd;
		color: #856404;
	}

	.article-actions {
		display: flex;
		gap: 0.5rem;
	}

	button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	button:not(:disabled):hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-size: 1rem;
	}

	.btn-primary:hover:not(:disabled) {
		background: linear-gradient(135deg, #5568d3 0%, #653a8b 100%);
	}

	.btn-secondary {
		background: #e2e8f0;
		color: #2d3748;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #cbd5e0;
	}

	.btn-danger {
		background: #fed7d7;
		color: #c53030;
	}

	.btn-danger:hover:not(:disabled) {
		background: #fc8181;
		color: white;
	}

	.btn-icon {
		background: white;
		color: #4a5568;
		border: 2px solid #e2e8f0;
	}

	.btn-icon:hover:not(:disabled) {
		background: #f7fafc;
		border-color: #667eea;
		color: #667eea;
	}

	.pagination {
		background: white;
		padding: 1.5rem;
		border-radius: 16px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.pagination-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.page-info {
		font-weight: 600;
		color: #4a5568;
		padding: 0 1rem;
	}

	.limit-control {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.limit-control input {
		width: 80px;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		header {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}

		h1 {
			font-size: 2rem;
		}

		.article-card {
			flex-direction: column;
			gap: 1rem;
			align-items: flex-start;
		}

		.article-actions {
			width: 100%;
			justify-content: flex-end;
		}

		.pagination {
			flex-direction: column;
		}

		.pagination-controls {
			width: 100%;
			justify-content: center;
		}
	}
</style>
