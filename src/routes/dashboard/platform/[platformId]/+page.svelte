<script lang="ts">
    import type { PageData } from './$types';
    import DataTable from './data-table.svelte';

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

<div class="my-10">
    <DataTable
        data={data.relevantCases}
        count={data.count}
        pagination={data.pagination}
        sorting={data.sorting}
        columnFilters={data.columnFilters}
    />
</div>
