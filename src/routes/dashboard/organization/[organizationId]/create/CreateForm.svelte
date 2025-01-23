<script lang="ts">
	import * as Form from '$ui/form';
	import { Input } from '$ui/input';
	import { formSchema, type FormSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Card from '$ui/card';

	interface Props {
		data: SuperValidated<Infer<FormSchema>>;
	}

	let { data }: Props = $props();

	const form = superForm(data, {
		validators: zodClient(formSchema)
	});

	const { form: formData, enhance } = form;
</script>

<div class="flex h-screen w-full items-center justify-center">
	<Card.Root class="mx-auto max-w-(--breakpoint-sm)">
		<Card.Header>
			<Card.Title>Create Platform</Card.Title>
			<Card.Description>
				Platform represents a service that you want to integrate with.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form class="max-w-(--breakpoint-md) space-y-5" method="POST" use:enhance>
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
				<Form.Field {form} name="callbackUrl">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Webhook URL</Form.Label>
							<Input {...props} bind:value={$formData.callbackUrl} />
						{/snippet}
					</Form.Control>
					<Form.Description>
						This is the URL where we will send you notifications and retrieve subject data from. It
						should be a valid URL.
					</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Button class="w-full">Create</Form.Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
