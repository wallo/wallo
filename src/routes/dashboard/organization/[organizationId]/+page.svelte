<script lang="ts">
	import { Button } from '$ui/button';
	import { ChevronRight, Plus } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<h1 class="my-5 flex max-w-screen-sm place-content-between text-4xl font-extrabold">
	{data.organization.name}
</h1>

<h2 class="my-3 flex max-w-screen-md place-content-between text-2xl font-extrabold">
	Manage Platforms
	<Button variant="secondary" on:click={() => goto('create')}>
		<Plus class="me-2 h-4 w-4"></Plus>
		Add
	</Button>
</h2>

<ul class="flex max-w-screen-md flex-col gap-2">
	{#each data.platforms as platform}
		<li class="flex">
			<a
				class="flex w-full place-content-between rounded-md border px-4 py-3 font-mono text-sm"
				href="/dashboard/platform/{platform.id}/edit"
			>
				{platform.name}
				<ChevronRight></ChevronRight>
			</a>
		</li>
	{/each}
</ul>
