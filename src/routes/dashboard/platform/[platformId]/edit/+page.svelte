<script lang="ts">
	import Separator from '$ui/separator/separator.svelte';
	import type { PageData } from './$types.js';
	import * as Avatar from '$ui/avatar';
	import EditForm from './EditForm.svelte';
	import InviteForm from './InviteForm.svelte';
	import DeleteInvitationForm from './DeleteInvitationForm.svelte';
	import DeleteModeratorForm from './DeleteModeratorForm.svelte';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<div class="flex">
	<div class="basis-2/3">
		<EditForm data={data.editPlatformForm} />
	</div>
	<Separator orientation="vertical" class="mx-4 h-auto" />
	<div class="flex-1">
		<div class="my-2 grid gap-2">
			{#if data.moderators.length}
				<h2 class="my-2 text-2xl font-bold">Moderators</h2>
				{#each data.moderators as moderator}
					<div class="ms-4 flex items-center justify-between">
						<div class="flex items-center gap-2">
							<Avatar.Root>
								<Avatar.Image src={moderator.image} alt={moderator.name} />
								<Avatar.Fallback>{moderator.name}</Avatar.Fallback>
							</Avatar.Root>
							<div class="ml-2">
								<h2 class="text-lg font-bold">{moderator.name}</h2>
								<p class="text-sm text-gray-500">{moderator.email}</p>
							</div>
						</div>
						<DeleteModeratorForm data={data.deleteModeratorForm} id={moderator.id}
						></DeleteModeratorForm>
					</div>
				{/each}
			{/if}
		</div>
		<div class="my-4 grid gap-2">
			<h2 class="my-2 text-2xl font-bold">Invitations</h2>
			{#if data.invitations.length}
				{#each data.invitations as invitation}
					<div class="flex items-center justify-between">
						<div class="ms-4">
							<h3 class="text-lg font-bold">{invitation}</h3>
							<p class="text-sm text-gray-500">Invited</p>
						</div>
						<DeleteInvitationForm data={data.invitePlatformForm} email={invitation} />
					</div>
				{/each}
			{/if}
			<InviteForm data={data.invitePlatformForm} />
		</div>
	</div>
</div>
