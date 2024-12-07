<script lang="ts">
	import * as Form from '$ui/form';
	import { Input } from '$ui/input';
	import { formSchema, type FormSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	interface Props {
		data: SuperValidated<Infer<FormSchema>>;
	}

	let { data }: Props = $props();

	const form = superForm(data, {
		validators: zodClient(formSchema)
	});

	const { form: formData, enhance } = form;
</script>

<h1 class="my-3 flex max-w-screen-sm place-content-between text-2xl font-extrabold">
	Create Platform
</h1>
<form class="flex max-w-screen-md flex-col gap-2" method="POST" use:enhance>
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
	<Form.Button>Submit</Form.Button>
</form>
