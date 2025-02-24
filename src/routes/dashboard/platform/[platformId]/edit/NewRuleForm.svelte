<script lang="ts">
    import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
    import { zodClient } from 'sveltekit-superforms/adapters';
    import { createRuleSchema, type CreateRuleSchema } from './rules-schema';

    import * as Form from '$ui/form';
    import * as Dialog from '$ui/dialog';
    import { Input } from '$ui/input';
    import Button from '$ui/button/button.svelte';
    import Textarea from '$ui/textarea/textarea.svelte';

    interface Props {
        create: SuperValidated<Infer<CreateRuleSchema>>;
    }

    let { create }: Props = $props();

    const form = superForm(create, {
        validators: zodClient(createRuleSchema)
    });

    const { form: formData } = form;

    function formatId(id: string) {
        return id.replaceAll(' ', '-').replaceAll('_', '-').toLowerCase();
    }

    let formattedId = $state(formatId($formData.readableName));
</script>

<Dialog.Root>
    <Dialog.Trigger>
        <Button size="sm">Create Rule</Button>
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>Create Rule</Dialog.Header>
        <Dialog.Description>
            Fill in the details below to create a new rule for your platform.
        </Dialog.Description>
        <form class="flex max-w-(--breakpoint-md) flex-col gap-5" method="POST">
            <Form.Field {form} name="readableName">
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label>Id</Form.Label>
                        <Input
                            {...props}
                            value={formattedId}
                            oninput={(event) => {
                                const newValue = event.currentTarget.value;
                                formattedId = formatId(newValue);
                                $formData.readableName = formattedId;
                            }}
                        />
                    {/snippet}
                </Form.Control>
                <Form.Description
                    >This is your rule display name. Used for filtering.</Form.Description
                >
                <Form.FieldErrors />
            </Form.Field>
            <Form.Field {form} name="title">
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label>Title</Form.Label>
                        <Input {...props} bind:value={$formData.title} />
                    {/snippet}
                </Form.Control>
                <Form.Description>
                    This is the title of the rule. Keep it short and descriptive.
                </Form.Description>
                <Form.FieldErrors />
            </Form.Field>
            <Form.Field {form} name="description">
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label>Description</Form.Label>
                        <Textarea {...props} bind:value={$formData.description} />
                    {/snippet}
                </Form.Control>
                <Form.Description>
                    This is the description of the rule. It should be a detailed explanation of what
                    the rule enforces.
                </Form.Description>
                <Form.FieldErrors />
            </Form.Field>
            <Dialog.Footer>
                <div class="flex flex-wrap gap-2">
                    <Form.Button formaction="?/createRule">Create Rule</Form.Button>
                </div>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
