<script lang="ts">
	import * as Form from '$ui/form';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { commentFormSchema, type CommentFormSchema } from './comment-schema';
	import { Textarea } from '$ui/textarea';

	interface Props {
		data: SuperValidated<Infer<CommentFormSchema>>;
	}

	let { data }: Props = $props();

	const form = superForm(data, {
		validators: zodClient(commentFormSchema)
	});

	const { form: formData } = form;
</script>

<form method="POST" action="?/comment">
	<Form.Field {form} name="comment">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Comment</Form.Label>
				<Textarea {...props} bind:value={$formData.comment} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="ms-auto block w-3/12">Post</Form.Button>
</form>
