<script lang="ts">
	import * as Form from '$ui/form';
	import { Input } from '$ui/input';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { X } from 'lucide-svelte';
	import { deleteModeratorFormSchema, type DeleteModeratorFormSchema } from './delete-moderator';

	interface Props {
		data: SuperValidated<Infer<DeleteModeratorFormSchema>>;
		id: string;
	}

	let { data, id = $bindable() }: Props = $props();

	const form = superForm(data, {
		validators: zodClient(deleteModeratorFormSchema)
	});
</script>

<div>
	<form class="flex gap-2" method="POST">
		<Form.Field {form} name="id" class="hidden">
			<Form.Control>
				{#snippet children({ attrs })}
					<Input {...attrs} bind:value={id} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<div>
			<Form.Button size="icon" variant="ghost" formaction="?/deleteModerator">
				<X />
			</Form.Button>
		</div>
	</form>
</div>
