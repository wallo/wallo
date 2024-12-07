<script lang="ts">
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import type { PageData } from './$types';
	import { Card } from '$ui/card';
	import CardDescription from '$ui/card/card-description.svelte';
	import CommentForm from './comment-form.svelte';
	import { Separator } from '$ui/separator';
	import { Info } from 'lucide-svelte';
	import ActionForm from './action-form.svelte';
	import MediaDisplay from './MediaDisplay.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<h1 class="my-3 flex max-w-screen-md place-content-between text-2xl font-extrabold">
	Take Moderation Action
</h1>

<div class="mb-16 flex flex-wrap gap-4">
	<div class="grid grow basis-3/5 gap-4">
		<div class="flex w-full flex-col gap-1.5">
			<Label for="id">ID</Label>
			<Input type="text" id="id" placeholder="id" disabled value={data.moderationCase.relevantId} />
		</div>

		{#if 'medias' in data.subject}
			<div class="my-2 flex flex-col gap-4">
				<MediaDisplay medias={data.subject.medias}></MediaDisplay>
			</div>
		{/if}

		<div class="my-2 flex gap-8">
			<ActionForm
				data={data.actionForm}
				action={{ id: '__skip__', display: 'Skip', variant: 'outline' }}
			></ActionForm>
			{#each data.subject.possibleActions as possibleAction}
				<ActionForm data={data.actionForm} action={possibleAction}></ActionForm>
			{/each}
		</div>
	</div>
	<Separator class="mx-2 h-auto" orientation="vertical"></Separator>
	<div class="flex flex-1 basis-72 flex-col gap-2">
		<h1 class="text-lg font-extrabold">Discussion</h1>
		<CommentForm data={data.commentForm}></CommentForm>
		<div class="grid gap-2">
			{#each data.actions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) as action}
				{#if action.kind === 'comment'}
					<Card class="p-2">
						<p>{action.text}</p>
						<CardDescription class="text-end">
							{#if action.name}
								{action.name} -
							{/if}
							{action.createdAt.toLocaleString()}
						</CardDescription>
					</Card>
				{:else if action.kind === 'requestPublication'}
					<Card class="border-cyan-500 bg-cyan-500/10 p-2">
						<p class="flex gap-2">
							<Info class="h-6 w-6 text-cyan-500" />
							User has requested publishing this content
						</p>
						<CardDescription class="text-end">
							{#if action.name}
								{action.name} -
							{/if}
							{action.createdAt.toLocaleString()}
						</CardDescription>
					</Card>
				{:else}
					<Card class="border-orange-500 bg-orange-500/10 p-2">
						<p class="flex gap-2">
							<Info class="h-6 w-6 text-orange-500" />
							{action.display ?? action.id}
						</p>
						<CardDescription class="text-end">
							{#if action.name}
								{action.name} -
							{/if}
							{action.createdAt.toLocaleString()}
						</CardDescription>
					</Card>
				{/if}
			{/each}
		</div>
	</div>
</div>
