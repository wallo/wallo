<script lang="ts">
	import * as Form from '$ui/form';
	import { Input } from '$ui/input';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { inviteFormSchema, type InviteFormSchema } from './invite-moderator';

	interface Props {
		data: SuperValidated<Infer<InviteFormSchema>>;
	}

	let { data }: Props = $props();

	const form = superForm(data, {
		validators: zodClient(inviteFormSchema)
	});

	const { form: formData } = form;
</script>

<div>
	<h3 class="my-3 flex text-lg font-extrabold">Add Invitation</h3>
	<form class="flex gap-2" method="POST">
		<Form.Field {form} name="email" class="flex-1">
			<Form.Control>
				{#snippet children({ props })}
					<Input {...props} bind:value={$formData.email} placeholder="Email" />
				{/snippet}
			</Form.Control>
			<!-- <Form.Description>This is your organization display name.</Form.Description> -->
			<Form.FieldErrors />
		</Form.Field>
		<div class="flex gap-2">
			<Form.Button formaction="?/invite">Invite</Form.Button>
		</div>
	</form>
</div>
