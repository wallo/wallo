<script lang="ts">
	import { Card } from '$ui/card';
	import { Label } from '$ui/label';
	import type { Media } from '$lib/types';

	interface Props {
		medias?: Media[];
	}

	let { medias = [] }: Props = $props();
</script>

{#each medias as media}
	<div class="flex w-full flex-col gap-1.5">
		{#if media.tag}
			<Label>{media.tag}</Label>
		{/if}
		<Card class="overflow-hidden">
			{#if media.kind === 'text'}
				{#each media.message.split('\n') as message}
					<p class="p-2">
						{message}
					</p>
				{/each}
			{:else if media.kind === 'image'}
				<img src={media.url} alt={media.alt} />
			{:else if media.kind === 'video'}
				<!-- svelte-ignore a11y_media_has_caption -->
				<video src={media.url} controls>
					{#each media.captions ?? [] as caption}
						<track
							kind="captions"
							src={caption.url}
							srclang={caption.srclang}
							label={caption.label}
						/>
					{/each}
				</video>
			{/if}
		</Card>
	</div>
{/each}
