<script lang="ts">
	import { Button } from '$ui/button';
	import * as Card from '$ui/card';
	import { Layout, MessageSquare } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let platforms = $derived(data.platforms);
</script>

<h1 class="my-5 flex max-w-screen-sm place-content-between text-4xl font-extrabold">
	{data.organization.name}
</h1>

<h2 class="my-3 flex flex-wrap place-content-between items-center gap-2 text-2xl font-extrabold">
	Platforms in {data.organization.name}
	{#if platforms.length}
		<Button onclick={() => goto('/dashboard/platform/create')} class="ms-auto">
			Create New Platform
		</Button>
	{/if}
</h2>

<ul class="max-md:space-y-5 md:grid md:grid-cols-2 md:gap-5">
	{#each platforms as platform}
		<li>
			<a href="/dashboard/platform/{platform.id}/edit">
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="text-lg font-medium">{platform.name}</Card.Title>
					</Card.Header>
					<Card.Content class="pt-0">
						<div class="flex items-center space-x-2 text-muted-foreground">
							<MessageSquare class="h-4 w-4" />
							<span class="text-sm">{platform.caseCount} cases</span>
						</div>
					</Card.Content>
				</Card.Root>
			</a>
		</li>
	{:else}
		<Card.Root class="text-center col-span-2">
			<Card.Header>
				<Card.Title class="flex flex-col items-center">
					<Layout class="w-12 h-12 mb-4 text-muted-foreground" />
					No Platforms Yet
				</Card.Title>
				<Card.Description>
					You're not moderating any platforms yet. They will appear here once you're assigned.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<Button onclick={() => goto('/dashboard/platform/create')}>Create New Platform</Button>
			</Card.Content>
		</Card.Root>
	{/each}
</ul>
