<script lang="ts">
    import type { Case } from '$lib/types';

    import * as Table from '$ui/table';
    import { createSvelteTable, FlexRender, renderComponent } from '$ui/data-table';
    import { Button } from '$ui/button';
    import { goto } from '$app/navigation';
    import {
        type ColumnDef,
        type ColumnFiltersState,
        type PaginationState,
        type SortingState,
        getCoreRowModel
    } from '@tanstack/table-core';
    import * as Select from '$ui/select';
    import DataTableSortableHeader from './data-table-sortable-header.svelte';
    import { Label } from '$ui/label';
    import { Input } from '$ui/input';
    import { Search } from 'lucide-svelte';
    import { navigating, page } from '$app/state';
    import { onMount, untrack } from 'svelte';
    import LoadingIcon from '$lib/loading-icon.svelte';

    interface Props {
        data: Case[];
        count: number;
        pagination: PaginationState;
        sorting: SortingState;
        columnFilters: ColumnFiltersState;
    }

    let { data, pagination, count, sorting, columnFilters }: Props = $props();

    let mounting = $state(true);
    let navigatingBoolean = $derived(
        navigating.type !== null &&
            navigating.from?.route.id &&
            navigating.to?.route.id &&
            navigating.from.route.id === navigating.to.route.id
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

    const columns: ColumnDef<Case>[] = [
        {
            accessorKey: 'relevantId',
            header: 'ID'
        },
        {
            accessorKey: 'status',
            header: 'Status'
        },
        {
            accessorKey: 'kind',
            header: 'Kind'
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) =>
                renderComponent(DataTableSortableHeader, {
                    header: 'Created At',
                    sortingStatus: column.getIsSorted(),
                    onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
                }),
            cell: ({ row }) => {
                return (row.getValue('createdAt') as Date).toLocaleString();
            },
            sortingFn: 'datetime'
        }
    ];

    const table = createSvelteTable({
        get data() {
            return data;
        },
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            get pagination() {
                return pagination;
            },
            get sorting() {
                return sorting;
            },
            get columnFilters() {
                return columnFilters;
            }
        },
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        get rowCount() {
            return count;
        },
        enableSortingRemoval: true,
        enableMultiRemove: false,
        onPaginationChange: (updater) => {
            const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
            const q = new URLSearchParams(page.url.searchParams);
            q.set('pageIndex', String(newPagination.pageIndex));
            q.set('pageSize', String(newPagination.pageSize));
            goto(`?${q}`, { noScroll: true });
        },
        onSortingChange: (updater) => {
            const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
            const q = new URLSearchParams(page.url.searchParams);
            if (newSorting.length > 0) {
                q.set('order', newSorting[0].desc ? 'DESC' : 'ASC');
                q.set('column', newSorting[0].id);
            } else {
                q.delete('order');
                q.delete('column');
            }
            goto(`?${q}`, { noScroll: true });
        },
        onColumnFiltersChange: (updater) => {
            const newColumnFilters =
                typeof updater === 'function' ? updater(columnFilters) : updater;
            const q = new URLSearchParams(page.url.searchParams);
            for (const id of ['status', 'kind', 'relevantId']) {
                q.delete(id);
            }
            for (const { id, value } of newColumnFilters) {
                if (typeof value === 'string' && value.length > 0) {
                    q.set(id, value);
                }
            }
            goto(`?${q}`, { noScroll: true });
        }
    });

    const kinds = [
        { value: 'all', label: 'All' },
        { value: 'user', label: 'User' },
        { value: 'community', label: 'Community' },
        { value: 'content', label: 'Content' }
    ];

    const statuses = [
        { value: 'all', label: 'All' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'unresolved', label: 'Unresolved' }
    ];

    let kindFilter: string = $derived(
        (columnFilters.find((filter) => filter.id === 'kind')?.value as string | undefined) ?? 'all'
    );

    let statusFilter: string = $derived(
        (columnFilters.find((filter) => filter.id === 'status')?.value as string | undefined) ??
            'all'
    );

    let idLikeValue = $state(
        (columnFilters.find((filter) => filter.id === 'relevantId')?.value as string | undefined) ??
            ''
    );

    function updateRelevantIdFilter() {
        table.getColumn('relevantId')?.setFilterValue(() => idLikeValue ?? '');
    }
</script>

<div class="my-2 flex flex-wrap items-end gap-2 gap-y-4">
    <div class="me-auto flex flex-col gap-2">
        <Label for="searchFilter">Search</Label>
        <div class="flex items-center gap-2">
            <Input
                type="text"
                id="searchFilter"
                class="input"
                bind:value={idLikeValue}
                onchange={updateRelevantIdFilter}
            />
            <Button variant="outline" size="icon" onclick={updateRelevantIdFilter}>
                <Search class="mx-4 size-4"></Search>
            </Button>
        </div>
    </div>
    <div class="flex flex-col gap-2">
        <Label for="kindFilter">Kind</Label>
        <Select.Root
            type="single"
            value={kindFilter}
            onValueChange={(newValue) => {
                table.getColumn('kind')?.setFilterValue(() => newValue);
            }}
        >
            <Select.Trigger class="w-48 min-w-min">
                {kinds.find((kind) => kind.value === kindFilter)?.label ?? kinds[0].label}
            </Select.Trigger>
            <Select.Content>
                <Select.Group>
                    {#each kinds as kind}
                        <Select.Item value={kind.value} label={kind.label}>{kind.label}</Select.Item
                        >
                    {/each}
                </Select.Group>
            </Select.Content>
        </Select.Root>
    </div>
    <div class="flex flex-col gap-2">
        <Label for="statusFilter">Status</Label>
        <Select.Root
            type="single"
            value={statusFilter}
            onValueChange={(newValue) => {
                table.getColumn('status')?.setFilterValue(() => newValue);
            }}
        >
            <Select.Trigger class="w-48 min-w-min">
                {statuses.find((status) => status.value === statusFilter)?.label ??
                    statuses[0].label}
            </Select.Trigger>
            <Select.Content>
                <Select.Group>
                    {#each statuses as status}
                        <Select.Item value={status.value} label={status.label}
                            >{status.label}</Select.Item
                        >
                    {/each}
                </Select.Group>
            </Select.Content>
        </Select.Root>
    </div>
</div>

<div class="rounded-md border">
    <Table.Root>
        <Table.Header>
            {#each table.getHeaderGroups() as headerGroup}
                <Table.Row>
                    {#each headerGroup.headers as header (header.id)}
                        <Table.Head>
                            {#if !header.isPlaceholder}
                                <FlexRender
                                    content={header.column.columnDef.header}
                                    context={header.getContext()}
                                />
                            {/if}
                        </Table.Head>
                    {/each}
                </Table.Row>
            {/each}
        </Table.Header>
        <Table.Body>
            {#if mounting || longNavigating}
                <Table.Row>
                    <Table.Cell colspan={columns.length} class="h-[50vh]">
                        <div class="flex w-full flex-col items-center gap-2 opacity-50">
                            <LoadingIcon height="3em" width="3em" />
                            Loading...
                        </div>
                    </Table.Cell>
                </Table.Row>
            {:else}
                {#each table.getRowModel().rows as row (row.id)}
                    <a
                        href={`/dashboard/platform/${page.params.platformId}/case/${row.original.kind}/${row.original.relevantId}`}
                        class="contents"
                    >
                        <Table.Row data-state={row.getIsSelected() && 'selected'}>
                            {#each row.getVisibleCells() as cell (cell.id)}
                                <Table.Cell>
                                    <FlexRender
                                        content={cell.column.columnDef.cell}
                                        context={cell.getContext()}
                                    />
                                </Table.Cell>
                            {/each}
                        </Table.Row>
                    </a>
                {:else}
                    <Table.Row>
                        <Table.Cell colspan={columns.length} class="h-24 text-center"
                            >No results.</Table.Cell
                        >
                    </Table.Row>
                {/each}
            {/if}
        </Table.Body>
    </Table.Root>
</div>

<div class="flex items-center justify-end space-x-2 py-4">
    <div>
        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
    </div>
    <Button
        variant="outline"
        size="sm"
        onclick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
    >
        Previous
    </Button>
    <Button
        variant="outline"
        size="sm"
        onclick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
    >
        Next
    </Button>
</div>
