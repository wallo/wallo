<script lang="ts">
	import { ChevronRight, Plus } from 'lucide-svelte';
	import Button from '$ui/button/button.svelte';
	import { goto } from '$app/navigation';
	import InviteForm from './InviteForm.svelte';

	let { data } = $props();

	let platforms = $derived(data.platformsAdminOf.concat(data.platformsModeratorOf));

	let platformsUnique = $derived(
		platforms.filter((p, i) => i === platforms.findIndex((p2) => p2.id === p.id))
	);
</script>

<h2 class="my-3 flex max-w-screen-md place-content-between text-2xl font-extrabold">
	Organizations You Manage
	<Button variant="secondary" onclick={() => goto('/dashboard/organization/create')}>
		<Plus />
		New
	</Button>
</h2>
<ul class="flex max-w-screen-md flex-col gap-2">
	{#each data.organizationsAdminOf as organization}
		<li class="flex">
			<a
				class="flex w-full place-content-between items-center rounded-md border px-4 py-3 text-sm"
				href="/dashboard/organization/{organization.id}"
			>
				{organization.name}
				<ChevronRight></ChevronRight>
			</a>
		</li>
	{/each}
</ul>

<h2 class="my-3 flex max-w-screen-sm place-content-between text-2xl font-extrabold">
	Platforms You Moderate
</h2>
<ul class="flex max-w-screen-md flex-col gap-2">
	{#each platformsUnique as platform}
		<li class="flex">
			<a
				class="flex w-full place-content-between items-center rounded-md border px-4 py-3 text-sm"
				href="/dashboard/platform/{platform.id}"
			>
				{platform.name}
				<ChevronRight></ChevronRight>
			</a>
		</li>
	{/each}
</ul>

{#if data.platformsInvitedTo.length}
	<h2 class="my-3 flex text-2xl font-extrabold">Invitations</h2>
	<ul class="flex max-w-screen-md flex-col gap-2">
		{#each data.platformsInvitedTo as platform}
			<li class="flex w-full place-content-between items-center rounded-md border px-4 py-3">
				{platform.name}
				<div>
					<InviteForm data={data.inviteForm} platformId={platform.id}></InviteForm>
				</div>
			</li>
		{/each}
	</ul>
{/if}
