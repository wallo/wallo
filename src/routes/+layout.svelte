<script lang="ts">
    import { ModeWatcher } from 'mode-watcher';
    import '../app.css';
    import '@fontsource/geist-sans/400.css';
    import '@fontsource/geist-sans/500.css';
    import '@fontsource/geist-sans/700.css';
    import { onMount, untrack } from 'svelte';
    import { navigating, page } from '$app/state';
    import LoadingIcon from '$lib/loading-icon.svelte';

    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
    let mounting = $state(true);
    let navigatingBoolean = $derived(
        navigating.type !== null &&
            !(
                navigating.from?.route.id &&
                navigating.to?.route.id &&
                navigating.from.route.id === navigating.to.route.id
            )
    );

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

    $effect(() => {
        if (navigatingBoolean) {
            untrack(() => {
                stopTimer = startTimer(() => {
                    longNavigating = true;
                }, 100);
            });
        } else {
            untrack(() => {
                stopTimer();
                longNavigating = false;
            });
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
    <meta property="og:url" content={page.url.toString()} />
    <meta property="og:image" content="{page.url.origin}/wallo-thumbnail.png" />
    <meta property="og:site_name" content="Wallo" />
    <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<ModeWatcher />
{#if mounting || longNavigating}
    <div class="fixed top-0 left-0 z-50 flex h-full w-full items-center justify-center">
        <div class="flex flex-col items-center gap-2 opacity-50">
            <LoadingIcon width="3em" height="3em" />
            Loading...
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
