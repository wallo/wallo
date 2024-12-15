<script lang="ts">
	import * as Form from '$ui/form';
	import { Input } from '$ui/input';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Check, X } from 'lucide-svelte';
	import { inviteFormSchema, type InviteFormSchema } from './invite-schema';

	interface Props {
		data: SuperValidated<Infer<InviteFormSchema>>;
		platformId: string;
	}

	let { data, platformId = $bindable() }: Props = $props();

	const form = superForm(data, {
		validators: zodClient(inviteFormSchema)
	});
</script>

<div class="flex justify-end gap-4">
	<form class="contents" method="POST">
		<Form.Field {form} name="platformId" class="hidden">
			<Form.Control>
				{#snippet children({ props })}
					<Input {...props} bind:value={platformId} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button variant="outline" formaction="?/deleteInvite">
			<X /> Decline
		</Form.Button>
		<Form.Button formaction="?/acceptInvite">
			<Check /> Accept
		</Form.Button>
	</form>
</div>
