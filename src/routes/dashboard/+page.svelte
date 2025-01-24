<script lang="ts">
	import { Building, Layout, MessageSquare } from 'lucide-svelte';
	import Button from '$ui/button/button.svelte';
	import InviteForm from './InviteForm.svelte';
	import * as Card from '$ui/card';
	import { Badge } from '$ui/badge';

	let { data } = $props();

	let platforms = $derived(data.platformsAdminOf.concat(data.platformsModeratorOf));

	let organizations = $derived(data.organizationsAdminOf);

	let platformsUnique = $derived(
		platforms.filter((p, i) => i === platforms.findIndex((p2) => p2.id === p.id))
	);

	let invites = $derived(data.platformsInvitedTo);
</script>

<div class="space-y-8">
	<div>
		<h2
			class="my-3 flex flex-wrap place-content-between items-center gap-2 text-2xl font-extrabold"
		>
			Organizations You Manage
			{#if organizations.length}
				<Button href="/dashboard/organization/create" class="ms-auto">
					Create New Organization
				</Button>
			{/if}
		</h2>
		<ul class="max-md:space-y-5 md:grid md:grid-cols-2 md:gap-5">
			{#each organizations as organization}
				<li>
					<a href="/dashboard/organization/{organization.id}">
						<Card.Root>
							<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
								<Card.Title class="text-lg font-medium">
									{organization.name}
								</Card.Title>
								<Badge>Admin</Badge>
							</Card.Header>
							<Card.Footer>
								<div class="text-muted-foreground flex items-center space-x-2">
									<Layout class="h-4 w-4" />
									<span class="text-sm">{organization.platformCount} platforms</span>
								</div>
							</Card.Footer>
						</Card.Root>
					</a>
				</li>
			{:else}
				<Card.Root class="text-center col-span-2">
					<Card.Header>
						<Card.Title class="flex flex-col items-center">
							<Building class="w-12 h-12 mb-4 text-muted-foreground" />
							No Organizations Yet
						</Card.Title>
						<Card.Description>
							You haven't created or joined any organizations. Start by creating a new one!
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<Button href="/dashboard/organization/create">Create New Organization</Button>
					</Card.Content>
				</Card.Root>
			{/each}
		</ul>
	</div>

	<div>
		<h2 class="my-3 text-2xl font-extrabold">Platforms You Moderate</h2>
		<ul class="max-md:space-y-5 md:grid md:grid-cols-2 md:gap-5">
			{#each platformsUnique as platform}
				<li>
					<a href="/dashboard/platform/{platform.id}">
						<Card.Root>
							<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
								<Card.Title class="text-lg font-medium">{platform.name}</Card.Title>
								<Badge
									>{data.platformsAdminOf.find((p) => p.id === platform.id)
										? 'Admin'
										: 'Moderator'}</Badge
								>
							</Card.Header>
							<Card.Content class="pt-0">
								<div class="text-muted-foreground flex items-center space-x-2">
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
					<Card.Footer></Card.Footer>
				</Card.Root>
			{/each}
		</ul>
	</div>

	{#if invites.length}
		<div>
			<h2 class="my-3 text-2xl font-extrabold">Invitations</h2>
			<ul class="max-md:space-y-5 md:grid md:grid-cols-2 md:gap-5">
				{#each invites as platform}
					<li>
						<Card.Root>
							<Card.Header>
								<Card.Title class="text-lg font-medium">{platform.name}</Card.Title>
								<Card.Description>You've been invited to moderate this platform</Card.Description>
							</Card.Header>
							<Card.Content>
								<InviteForm data={data.inviteForm} platformId={platform.id}></InviteForm>
							</Card.Content>
						</Card.Root>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
