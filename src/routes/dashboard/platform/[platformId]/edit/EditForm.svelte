<script lang="ts">
	import * as Form from '$ui/form';
	import { Input } from '$ui/input';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { editFormSchema, type EditFormSchema } from './edit-schema';

	interface Props {
		data: SuperValidated<Infer<EditFormSchema>>;
	}

	let { data }: Props = $props();

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
		<Form.Field {form} name="platformName">
			<Form.Control>
				{#snippet children({ attrs })}
					<Form.Label>Platform Name</Form.Label>
					<Input {...attrs} bind:value={$formData.platformName} />
				{/snippet}
			</Form.Control>
			<!-- <Form.Description>This is your organization display name.</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="callbackUrl">
			<Form.Control>
				{#snippet children({ attrs })}
					<Form.Label>Callback URL</Form.Label>
					<Input {...attrs} bind:value={$formData.callbackUrl} />
				{/snippet}
			</Form.Control>
			<!-- <Form.Description>This is your organization display name.</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="secret">
			<Form.Control>
				{#snippet children({ attrs })}
					<Form.Label>Secret</Form.Label>
					<Input {...attrs} disabled bind:value={$formData.secret} />
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
