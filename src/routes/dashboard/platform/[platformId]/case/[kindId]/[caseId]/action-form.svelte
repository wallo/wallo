<script lang="ts">
	import * as Form from '$ui/form';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { actionFormSchema, type ActionFormSchema } from './action-schema';
	import type { PossibleAction } from '$lib/types';
	import Input from '$ui/input/input.svelte';

	const form = superForm(data, {
		validators: zodClient(actionFormSchema)
	});

	interface Props {
		data: SuperValidated<Infer<ActionFormSchema>>;
		action: PossibleAction;
	}

	let { data, action }: Props = $props();
</script>

<form method="POST" action="?/action" class="flex-1">
	<Form.Field {form} name="id" class="hidden">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} value={action.id} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="display" class="hidden">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} value={action.display} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="w-full" variant={action.variant ?? 'default'}
		>{action.display ?? action.id}</Form.Button
	>
</form>
