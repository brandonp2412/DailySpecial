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

<label
	>Search<input type="text" placeholder="Search..." bind:value={search} onchange={refresh} /></label
>
<label
	>Status
	<select onchange={refresh} bind:value={status}>
		<option value=""></option>
		<option value="published">Published</option>
		<option value="draft">Draft</option>
	</select>
</label>

{#each data.articles as article}
	<div>
		{article.title}
		<button onclick={() => goto(`/articles/${article.id}`)}>Edit</button>
		<button
			onclick={() => {
				const ok = confirm(`Are you sure you want to delete ${article.title}?`);
				if (ok) {
					fetch(`/api/articles`, {
						method: 'DELETE',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ id: article.id })
					}).then(() => invalidateAll());
				}
			}}>Delete</button
		>
	</div>
{/each}

<div>
	<button>Add article</button>
</div>

<div>
	<button
		onclick={() => {
			currentPage--;
			updateParams(currentPage, limit);
		}}
		disabled={currentPage <= 1}
	>
		Prev page
	</button>
	<span>Page {currentPage}</span>
	<button
		onclick={() => {
			currentPage++;
			updateParams(currentPage, limit);
		}}
	>
		Next page
	</button>
	<label
		>Limit<input type="number" placeholder="Limit" bind:value={limit} onchange={refresh} /></label
	>
</div>
