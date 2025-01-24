<script lang="ts">
    import type { PageData } from './$types.js';
    import * as Avatar from '$ui/avatar';
    import EditForm from './EditForm.svelte';
    import InviteForm from './InviteForm.svelte';
    import DeleteInvitationForm from './DeleteInvitationForm.svelte';
    import DeleteModeratorForm from './DeleteModeratorForm.svelte';
    import * as Card from '$ui/card';
    import * as Alert from '$ui/alert';
    import { CircleAlert } from 'lucide-svelte';
    import { Button } from '$ui/button';
    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();

    let copiedActions: number[] = $state([]);

    let secret = $derived(data.secret);
</script>

<div class="max-md:space-y-4 md:flex md:flex-row md:gap-4">
    <div class="flex-3 space-y-2">
        {#if (secret?.length ?? 0) > 0}
            <Alert.Root variant="destructive">
                <CircleAlert class="size-4" />
                <Alert.Title>Copy Your API Token Now!</Alert.Title>
                <Alert.Description>
                    It will not be shown again. If you lose it, you will have to regenerate a new
                    one.
                    <div class="my-2 flex gap-2">
                        <div
                            class="border-input bg-background text-secondary-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
                        >
                            {secret}
                        </div>
                        <Button
                            onclick={() => {
                                navigator.clipboard.writeText(secret ?? '');
                                const copiedTime = new Date().getTime();
                                copiedActions.push(copiedTime);
                                setTimeout(() => {
                                    copiedActions = copiedActions.filter(
                                        (time) => time !== copiedTime
                                    );
                                }, 2000);
                            }}
                        >
                            {#if copiedActions.length > 0}
                                Copied!
                            {:else}
                                Copy
                            {/if}
                        </Button>
                    </div>
                </Alert.Description>
            </Alert.Root>
        {/if}
        <EditForm data={data.editPlatformForm} platformId={data.platformId} />
    </div>
    <div class="flex-1 space-y-2">
        <Card.Root>
            <Card.Header>
                <Card.Title>Team Members</Card.Title>
                <Card.Description>Manage your team members</Card.Description>
            </Card.Header>
            <Card.Content class="grid gap-6">
                {#each data.moderators as moderator}
                    <div class="flex items-center justify-between space-x-4">
                        <div class="flex items-center space-x-4">
                            <Avatar.Root>
                                <Avatar.Image src={moderator.image} alt={moderator.name} />
                                <Avatar.Fallback>{moderator.name}</Avatar.Fallback>
                            </Avatar.Root>
                            <div>
                                <p class="text-sm leading-none font-medium">{moderator.name}</p>
                                <p
                                    class="text-muted-foreground max-w-40 overflow-hidden text-sm text-ellipsis whitespace-nowrap"
                                    title={moderator.email}
                                >
                                    {moderator.email}
                                </p>
                            </div>
                        </div>
                        <DeleteModeratorForm data={data.deleteModeratorForm} id={moderator.id}
                        ></DeleteModeratorForm>
                    </div>
                {:else}
                    <p class="text-gray-500">No moderators yet</p>
                {/each}
            </Card.Content>
        </Card.Root>
        <Card.Root>
            <Card.Header>
                <Card.Title>Invitations</Card.Title>
                <Card.Description>Manage your invitations</Card.Description>
            </Card.Header>
            <Card.Content class="grid gap-6">
                {#each data.invitations as invitation}
                    <div class="flex items-center justify-between space-x-4">
                        <div class="flex items-center space-x-4">
                            <div>
                                <p class="text-sm leading-none font-medium">{invitation}</p>
                                <p class="text-muted-foreground text-sm">Invited</p>
                            </div>
                        </div>
                        <DeleteInvitationForm data={data.invitePlatformForm} email={invitation} />
                    </div>
                {/each}
                <InviteForm data={data.invitePlatformForm} />
            </Card.Content>
        </Card.Root>
    </div>
</div>
