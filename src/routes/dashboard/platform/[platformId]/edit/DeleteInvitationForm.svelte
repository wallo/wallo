<script lang="ts">
	import * as Form from '$ui/form';
	import { Input } from '$ui/input';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { inviteFormSchema, type InviteFormSchema } from './invite-moderator';
	import { X } from 'lucide-svelte';

	interface Props {
		data: SuperValidated<Infer<InviteFormSchema>>;
		email: string;
	}

	let { data, email = $bindable() }: Props = $props();

	const form = superForm(data, {
		validators: zodClient(inviteFormSchema)
	});
</script>

<div>
	<form class="flex gap-2" method="POST">
		<Form.Field {form} name="email" class="hidden">
			<Form.Control>
				{#snippet children({ attrs })}
					<Input {...attrs} bind:value={email} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<div>
			<Form.Button size="icon" variant="ghost" formaction="?/deleteInvite">
				<X />
			</Form.Button>
		</div>
	</form>
</div>
