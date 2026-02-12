<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { data }: { data: PageData } = $props();

	const isNew = $derived(page.params.id === 'new');

	let article = $state({
		title: '',
		author: '',
		status: 'draft' as 'draft' | 'published',
		createdAt: ''
	});

	$effect(() => {
		if (data.article) {
			article.title = data.article.title;
			article.createdAt = data.article.createdAt;
			article.status = data.article.status;
			article.author = data.article.author;
		}
	});

	let saving = $state(false);
	let error = $state('');

	async function handleSubmit() {
		error = '';
		saving = true;

		try {
			const url = isNew ? '/api/articles' : `/api/articles/${page.params.id}`;
			const method = isNew ? 'POST' : 'PUT';
			const createdAt = isNew ? new Date().toISOString() : article.createdAt;

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(isNew ? article : { ...article, id: page.params.id, createdAt })
			});

			if (!response.ok) {
				throw new Error('Failed to save article');
			}

			goto('/');
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			saving = false;
		}
	}
</script>

<div class="container">
	<div class="form-wrapper">
		<header>
			<div>
				<h1>{isNew ? 'Create New Article' : 'Edit Article'}</h1>
				<p class="subtitle">{isNew ? 'Write your next masterpiece' : 'Make your changes'}</p>
			</div>
			<button class="btn-ghost" onclick={() => goto('/')}> ← Back to Articles </button>
		</header>

		{#if error}
			<div class="error-banner">
				<span>⚠️</span>
				<p>{error}</p>
			</div>
		{/if}

		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
		>
			<div class="form-group">
				<label for="title">
					<span class="label-text">Title</span>
					<span class="required">*</span>
				</label>
				<input
					id="title"
					type="text"
					placeholder="Enter article title..."
					bind:value={article.title}
					required
				/>
			</div>

			<div class="form-group">
				<label for="title">
					<span class="label-text">Author</span>
					<span class="required">*</span>
				</label>
				<input
					id="author"
					type="text"
					placeholder="Enter author name..."
					bind:value={article.author}
					required
				/>
			</div>

			<div class="form-group">
				<label for="status">
					<span class="label-text">Status</span>
				</label>
				<select id="status" bind:value={article.status}>
					<option value="draft">Draft</option>
					<option value="published">Published</option>
				</select>
			</div>

			<div class="form-actions">
				<button type="button" class="btn-secondary" onclick={() => goto('/')}> Cancel </button>
				<button type="submit" class="btn-primary" disabled={saving}>
					{#if saving}
						<span class="spinner"></span>
						Saving...
					{:else}
						{isNew ? 'Create Article' : 'Update Article'}
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
		min-height: 100vh;
	}

	.form-wrapper {
		background: white;
		border-radius: 16px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2rem;
	}

	.subtitle {
		margin: 0;
		opacity: 0.9;
		font-size: 1rem;
	}

	.btn-ghost {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: 2px solid rgba(255, 255, 255, 0.3);
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.2s;
	}

	.btn-ghost:hover {
		background: rgba(255, 255, 255, 0.3);
		border-color: rgba(255, 255, 255, 0.5);
		transform: translateY(-1px);
	}

	.error-banner {
		background: #fed7d7;
		color: #c53030;
		padding: 1rem 2rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border-bottom: 2px solid #fc8181;
	}

	.error-banner span {
		font-size: 1.25rem;
	}

	.error-banner p {
		margin: 0;
		font-weight: 600;
	}

	form {
		padding: 2rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
		display: flex;
		flex-direction: column;
	}

	label {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-bottom: 0.5rem;
	}

	.label-text {
		font-size: 0.875rem;
		font-weight: 600;
		color: #4a5568;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.required {
		color: #e53e3e;
		font-weight: bold;
	}

	input[type='text'],
	select {
		padding: 0.875rem 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		font-size: 1rem;
		font-family: inherit;
		transition: all 0.2s;
		background: white;
	}

	input:focus,
	select:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	select {
		cursor: pointer;
		max-width: 300px;
	}

	.form-actions {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 2px solid #e2e8f0;
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}

	button {
		padding: 0.875rem 2rem;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		justify-content: center;
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	button:not(:disabled):hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		min-width: 160px;
	}

	.btn-primary:hover:not(:disabled) {
		background: linear-gradient(135deg, #5568d3 0%, #653a8b 100%);
	}

	.btn-secondary {
		background: #e2e8f0;
		color: #2d3748;
	}

	.btn-secondary:hover {
		background: #cbd5e0;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
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
			font-size: 1.5rem;
		}

		form {
			padding: 1.5rem;
		}

		.form-actions {
			flex-direction: column-reverse;
		}

		.form-actions button {
			width: 100%;
		}

		select {
			max-width: 100%;
		}
	}
</style>
