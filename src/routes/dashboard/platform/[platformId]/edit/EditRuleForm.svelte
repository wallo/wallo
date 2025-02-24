<script lang="ts">
    import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
    import { zodClient } from 'sveltekit-superforms/adapters';
    import {
        archiveRuleSchema,
        editRuleSchema,
        type ArchiveRuleSchema,
        type EditRuleSchema
    } from './rules-schema';
    import { Input } from '$ui/input';
    import * as Form from '$ui/form';
    import * as Accordion from '$ui/accordion';
    import * as Dialog from '$ui/dialog';
    import { Badge } from '$ui/badge';
    import { Button } from '$ui/button';
    import Textarea from '$ui/textarea/textarea.svelte';
    import type { Rule } from '$lib/types';

    interface Props {
        rule: Rule;
        edit: SuperValidated<Infer<EditRuleSchema>>;
        archive: SuperValidated<Infer<ArchiveRuleSchema>>;
        isArchived: boolean;
    }

    let { rule, edit, archive, isArchived }: Props = $props();

    const editForm = superForm(edit, {
        validators: zodClient(editRuleSchema)
    });

    const archiveForm = superForm(archive, {
        validators: zodClient(archiveRuleSchema)
    });

    const { form: editFormData } = editForm;
    const { form: archiveFormData } = archiveForm;

    function formatId(id: string) {
        return id.replaceAll(' ', '-').replaceAll('_', '-').toLowerCase();
    }

    let formattedId = $state(formatId($editFormData.readableName));
</script>

<Accordion.Item value={rule.ruleId}>
    <Accordion.Trigger>
        <h3 class="flex w-full items-center justify-between gap-4 pe-4 text-lg font-semibold">
            {rule.information.title}
            <Badge>{rule.readableName}</Badge>
        </h3>
    </Accordion.Trigger>
    <Accordion.Content>
        <p class="mb-4">
            {rule.information.description}
        </p>
        <p class="opacity-50">Created: {rule.createdAt.toLocaleString()}</p>
        <p class="opacity-50">Last updated: {rule.updatedAt.toLocaleString()}</p>
        <div class="mt-4 flex flex-wrap justify-between gap-2">
            <form method="POST">
                <Form.Field form={archiveForm} name="ruleId" class="hidden">
                    <Form.Control>
                        {#snippet children({ props })}
                            <Form.Label>Id</Form.Label>
                            <Input {...props} value={$archiveFormData.ruleId} readonly />
                        {/snippet}
                    </Form.Control>
                </Form.Field>
                {#if isArchived}
                    <div class="flex flex-wrap gap-2">
                        <Form.Button formaction={'?/unarchiveRule'} variant="outline">
                            Restore rule
                        </Form.Button>
                    </div>
                {:else}
                    <div class="flex flex-wrap gap-2">
                        <Form.Button formaction={'?/archiveRule'} variant="destructive">
                            Archive rule
                        </Form.Button>
                    </div>
                {/if}
            </form>
            {#if !isArchived}
                <Dialog.Root>
                    <Dialog.Trigger>
                        <Button variant="secondary">Edit rule</Button>
                    </Dialog.Trigger>
                    <Dialog.Content class="sm:max-w-[425px]">
                        <Dialog.Header>Edit rule</Dialog.Header>
                        <Dialog.Description>
                            Fill in the details below to edit the rule for your platform.
                        </Dialog.Description>
                        <form method="POST">
                            <Form.Field form={editForm} name="ruleId" class="hidden">
                                <Form.Control>
                                    {#snippet children({ props })}
                                        <Form.Label>Id</Form.Label>
                                        <Input
                                            {...props}
                                            bind:value={$editFormData.ruleId}
                                            readonly
                                        />
                                    {/snippet}
                                </Form.Control>
                            </Form.Field>
                            <Form.Field form={editForm} name="readableName">
                                <Form.Control>
                                    {#snippet children({ props })}
                                        <Form.Label>Id</Form.Label>
                                        <Input
                                            {...props}
                                            value={formattedId}
                                            oninput={(event) => {
                                                const newValue = event.currentTarget.value;
                                                formattedId = formatId(newValue);
                                                $editFormData.readableName = formattedId;
                                            }}
                                        />
                                    {/snippet}
                                </Form.Control>
                                <Form.Description>
                                    This is your rule display name. Used for filtering.
                                </Form.Description>
                                <Form.FieldErrors />
                            </Form.Field>
                            <Form.Field form={editForm} name="title">
                                <Form.Control>
                                    {#snippet children({ props })}
                                        <Form.Label>Title</Form.Label>
                                        <Input {...props} bind:value={$editFormData.title} />
                                    {/snippet}
                                </Form.Control>
                                <Form.Description>
                                    This is the title of the rule. Keep it short and descriptive.
                                </Form.Description>
                                <Form.FieldErrors />
                            </Form.Field>
                            <Form.Field form={editForm} name="description">
                                <Form.Control>
                                    {#snippet children({ props })}
                                        <Form.Label>Description</Form.Label>
                                        <Textarea
                                            {...props}
                                            bind:value={$editFormData.description}
                                        />
                                    {/snippet}
                                </Form.Control>
                                <Form.Description>
                                    This is the description of the rule. It should be a detailed
                                    explanation of what the rule enforces.
                                </Form.Description>
                                <Form.FieldErrors />
                            </Form.Field>
                            <div class="flex flex-wrap justify-end gap-2">
                                <Form.Button formaction="?/updateRule">Update rule</Form.Button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Root>
            {/if}
        </div>
    </Accordion.Content>
</Accordion.Item>
