<script lang="ts">
	import * as Form from '$ui/form';
	import { Input } from '$ui/input';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { editFormSchema, type EditFormSchema } from './edit-schema';
	import * as Alert from '$ui/alert';
	import { CircleAlert } from 'lucide-svelte';
	import Button from '$ui/button/button.svelte';
	import Label from '$ui/label/label.svelte';

	interface Props {
		data: SuperValidated<Infer<EditFormSchema>>;
		platformId: string;
		secret?: string;
	}

	let { data, secret, platformId }: Props = $props();

	let copiedActions: number[] = $state([]);

	const form = superForm(data, {
		validators: zodClient(editFormSchema)
	});

	const { form: formData } = form;
</script>

<div>
	<h1 class="my-3 flex max-w-screen-sm place-content-between text-2xl font-extrabold">
		Edit Platform
	</h1>
	<form class="flex max-w-screen-md flex-col gap-2" method="POST">
		{#if (secret?.length ?? 0) > 0}
			<Alert.Root variant="destructive">
				<CircleAlert class="size-4" />
				<Alert.Title>Copy Your API Token Now!</Alert.Title>
				<Alert.Description>
					It will not be shown again. If you lose it, you will have to regenerate a new one.
					<div class="my-2 flex gap-2">
						<div
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-secondary-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							{secret}
						</div>
						<Button
							onclick={() => {
								navigator.clipboard.writeText(secret ?? '');
								const copiedTime = new Date().getTime();
								copiedActions.push(copiedTime);
								setTimeout(() => {
									copiedActions = copiedActions.filter((time) => time !== copiedTime);
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
		<Form.Field {form} name="platformName">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Platform Name</Form.Label>
					<Input {...props} bind:value={$formData.platformName} />
				{/snippet}
			</Form.Control>
			<!-- <Form.Description>This is your organization display name.</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>
		<Label>Platform ID</Label>
		<Input readonly value={platformId} disabled />
		<Form.Field {form} name="callbackUrl">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Webhook URL</Form.Label>
					<Input {...props} bind:value={$formData.callbackUrl} />
				{/snippet}
			</Form.Control>
			<!-- <Form.Description>This is your organization display name.</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>
		<div class="flex gap-2">
			<Form.Button class="me-auto" variant="destructive" formaction="?/delete">Delete</Form.Button>
			<Form.Button variant="outline" formaction="?/regenerate">Regenerate</Form.Button>
			<Form.Button formaction="?/update">Update</Form.Button>
		</div>
	</form>
</div>
