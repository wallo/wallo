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

	const { form: formData } = form;
</script>

<div class="flex h-screen w-full items-center justify-center">
	<Card.Root class="mx-auto max-w-screen-sm">
		<Card.Header>
			<Card.Title>Create Organization</Card.Title>
			<Card.Description>
				Organization represents a group of platforms managed by a single entity.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form class="max-w-screen-md space-y-5" method="POST">
				<Form.Field {form} name="organization_name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Organization Name</Form.Label>
							<Input {...props} bind:value={$formData.organization_name} />
						{/snippet}
					</Form.Control>
					<Form.Description>This is your organization display name.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Button class="w-full">Create</Form.Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
