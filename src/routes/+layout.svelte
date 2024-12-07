<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import { navigating, page } from '$app/stores';
	import '../app.css';
	import '@fontsource/geist-sans/400.css';
	import '@fontsource/geist-sans/500.css';
	import '@fontsource/geist-sans/700.css';
	import { onMount } from 'svelte';
	import { Loader2 } from 'lucide-svelte';
	import { derived } from 'svelte/store';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let mounting = $state(true);
	let navigatingBoolean = derived(navigating, ($navigating) => $navigating !== null);

	const startTimer = (f: () => void, ms: number) => {
		let timer = setTimeout(f, ms);
		return () => {
			clearTimeout(timer);
		};
	};

	let longNavigating = $state(false);

	let stopTimer = $state(() => {
		// left empty for a reason
	});

	navigatingBoolean.subscribe((value) => {
		if (value) {
			if ($navigatingBoolean == false) {
				stopTimer = startTimer(() => {
					longNavigating = true;
				}, 100);
			}
		} else {
			stopTimer();
			longNavigating = false;
		}
	});

	onMount(() => {
		mounting = false;
	});
</script>

<svelte:head>
	<title>Wallo - Protect The Web</title>
	<meta property="og:title" content="Wallo - Protect The Web" />
	<meta
		property="og:description"
		content="The moderation platform for the web. Protect your community from harmful content."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.toString()} />
	<meta property="og:image" content="{$page.url.origin}/wallo-thumbnail.png" />
	<meta property="og:site_name" content="Wallo" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<ModeWatcher />
{#if mounting || longNavigating}
	<div class="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center">
		<div class="flex items-center">
			<Loader2 class="h-10 w-10 animate-spin text-primary/60"></Loader2>
		</div>
	</div>
{:else}
	{@render children?.()}
{/if}

<style>
	:global(pre code.hljs) {
		background: transparent;
	}
</style>
