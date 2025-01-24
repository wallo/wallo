<script lang="ts">
    import type { ComponentProps } from 'svelte';
    import { Button } from '$lib/components/ui/button/index.js';
    import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-svelte';

    let {
        variant = 'ghost',
        header,
        sortingStatus,
        ...restProps
    }: ComponentProps<typeof Button> & {
        header: string;
        sortingStatus: false | 'asc' | 'desc';
    } = $props();
</script>

<Button {variant} {...restProps}>
    {header}
    {#if sortingStatus === false}
        <ArrowUpDown class="ml-2 size-4" />
    {:else if sortingStatus === 'asc'}
        <ArrowUp class="ml-2 size-4" />
    {:else}
        <ArrowDown class="ml-2 size-4" />
    {/if}
</Button>
