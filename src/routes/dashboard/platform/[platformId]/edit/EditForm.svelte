<script lang="ts">
    import * as Form from '$ui/form';
    import { Input } from '$ui/input';
    import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
    import { zodClient } from 'sveltekit-superforms/adapters';
    import { editFormSchema, type EditFormSchema } from './edit-schema';
    import * as Card from '$ui/card';
    import Label from '$ui/label/label.svelte';
    import { Separator } from '$ui/separator';

    interface Props {
        data: SuperValidated<Infer<EditFormSchema>>;
        platformId: string;
    }

    let { data, platformId }: Props = $props();

    const form = superForm(data, {
        validators: zodClient(editFormSchema)
    });

    const { form: formData } = form;
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>Platform</Card.Title>
        <Card.Description>Edit your platform details</Card.Description>
    </Card.Header>
    <Card.Content>
        <form class="flex max-w-(--breakpoint-md) flex-col gap-5" method="POST">
            <Separator />
            <Form.Field {form} name="platformName">
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label>Platform Name</Form.Label>
                        <Input {...props} bind:value={$formData.platformName} />
                    {/snippet}
                </Form.Control>
                <Form.Description>This is your platform display name.</Form.Description>
                <Form.FieldErrors />
            </Form.Field>
            <div class="space-y-2">
                <Label>Platform ID</Label>
                <Input readonly value={platformId} disabled />
                <p class="text-muted-foreground text-sm">
                    This is your platform ID. It is unique and cannot be changed.
                </p>
            </div>
            <Form.Field {form} name="callbackUrl">
                <Form.Control>
                    {#snippet children({ props })}
                        <Form.Label>Webhook URL</Form.Label>
                        <Input {...props} bind:value={$formData.callbackUrl} />
                    {/snippet}
                </Form.Control>
                <Form.Description>
                    This is the URL where we will send you notifications and retrieve subject data
                    from. It should be a valid URL.
                </Form.Description>
                <Form.FieldErrors />
            </Form.Field>
            <div class="flex flex-wrap gap-2">
                <Form.Button class="me-auto" variant="destructive" formaction="?/delete">
                    Delete
                </Form.Button>
                <Form.Button variant="outline" formaction="?/regenerate"
                    >Regenerate API Token</Form.Button
                >
                <Form.Button formaction="?/update">Update platform</Form.Button>
            </div>
        </form>
    </Card.Content>
</Card.Root>
