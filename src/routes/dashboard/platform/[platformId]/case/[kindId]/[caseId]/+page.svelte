<script lang="ts">
    import { Input } from '$ui/input';
    import { Label } from '$ui/label';
    import type { PageData } from './$types';
    import { Card } from '$ui/card';
    import CardDescription from '$ui/card/card-description.svelte';
    import * as Accordion from '$ui/accordion';
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

<h1 class="my-3 flex max-w-(--breakpoint-md) place-content-between text-2xl font-extrabold">
    Take Moderation Action
</h1>

<div class="mb-16 flex flex-col gap-4 md:flex-row">
    <div class="grow basis-3/5 space-y-4">
        <div class="flex w-full flex-col gap-1.5">
            <Label for="id">ID</Label>
            <Input
                type="text"
                id="id"
                placeholder="id"
                disabled
                value={data.moderationCase.relevantId}
            />
        </div>

        {#if 'medias' in data.subject}
            <MediaDisplay medias={data.subject.medias}></MediaDisplay>
        {/if}

        <div class="flex gap-8">
            <ActionForm
                data={data.actionForm}
                action={{ id: '__skip__', display: 'Skip', variant: 'outline' }}
            ></ActionForm>
            {#each data.subject.possibleActions as possibleAction}
                <ActionForm data={data.actionForm} action={possibleAction}></ActionForm>
            {/each}
        </div>
    </div>
    <Separator class="mx-2 h-auto not-md:hidden" orientation="vertical"></Separator>
    <div class="flex flex-1 basis-72 flex-col gap-2">
        <h2 class="text-lg font-extrabold">Discussion</h2>
        <div class="space-y-2">
            {#each data.actions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) as action}
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
        <CommentForm data={data.commentForm}></CommentForm>
        <h2 class="text-lg font-extrabold">Rules</h2>
        <div class="space-y-2">
            <Accordion.Root type="multiple">
                {#each data.rules as rule, index}
                    <Accordion.Item>
                        <Accordion.Trigger>
                            {index + 1}.
                            {rule.information.title}
                        </Accordion.Trigger>
                        <Accordion.Content>
                            {rule.information.description}
                        </Accordion.Content>
                    </Accordion.Item>
                {/each}
            </Accordion.Root>
        </div>
    </div>
</div>
