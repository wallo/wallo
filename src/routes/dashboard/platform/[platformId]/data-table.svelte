<script lang="ts">
	import { run } from 'svelte/legacy';

	import type { Case } from '$lib/types';
	import { createTable, Render, Subscribe } from 'svelte-headless-table';
	import { readable, writable } from 'svelte/store';
	import { addPagination, addSortBy } from 'svelte-headless-table/plugins';

	import * as Table from '$lib/components/ui/table';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Label } from '$lib/components/ui/label';
	import { cn } from '$lib/utils';
	import { ArrowUpDown } from 'lucide-svelte';
	interface Props {
		data: Case[];
		count: number;
	}

	let { data, count }: Props = $props();

	const paginatedData = writable(data);
	const countStore = writable(count);

	const table = createTable(paginatedData, {
		page: addPagination({
			serverSide: true,
			serverItemCount: countStore,
			initialPageIndex: $page.url.searchParams.get('pageIndex')
				? Number($page.url.searchParams.get('pageIndex'))
				: undefined,
			initialPageSize: $page.url.searchParams.get('pageSize')
				? Number($page.url.searchParams.get('pageSize'))
				: undefined
		}),
		sort: addSortBy({
			initialSortKeys: $page.url.searchParams.get('order')
				? [
						{
							id: $page.url.searchParams.get('column') ?? 'createdAt',
							order: $page.url.searchParams.get('order') === 'DESC' ? 'desc' : 'asc'
						}
					]
				: [
						{
							id: 'createdAt',
							order: 'asc'
						}
					],
			disableMultiSort: false,
			toggleOrder: ['asc', 'desc'],
			serverSide: true
		})
	});

	const columns = table.createColumns([
		table.column({
			accessor: 'relevantId',
			header: 'ID',
			plugins: {
				sort: {
					disable: true
				}
			}
		}),
		table.column({
			accessor: 'status',
			header: 'Status',
			plugins: {
				sort: {
					disable: true
				}
			}
		}),
		table.column({
			accessor: 'kind',
			header: 'Kind',
			plugins: {
				sort: {
					disable: true
				}
			}
		}),
		table.column({
			accessor: 'createdAt',
			header: 'Created At',
			cell: ({ value }) => {
				return value.toLocaleString();
			}
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
		table.createViewModel(columns);

	const { pageIndex, pageSize, hasNextPage, hasPreviousPage } = pluginStates.page;
	const { sortKeys } = pluginStates.sort;

	const kinds = [
		{ value: 'all', label: 'All' },
		{ value: 'user', label: 'User' },
		{ value: 'community', label: 'Community' },
		{ value: 'content', label: 'Content' }
	];

	let kindFilter = $state(kinds[0]);

	const statuses = [
		{ value: 'all', label: 'All' },
		{ value: 'resolved', label: 'Resolved' },
		{ value: 'unresolved', label: 'Unresolved' }
	];

	let statusFilter = $state(kinds[0]);

	$effect(() => {
		const q = new URLSearchParams();
		if ($sortKeys.length) {
			console.log($sortKeys);
			q.set('order', $sortKeys[0].order === 'asc' ? 'ASC' : 'DESC');
			q.set('column', $sortKeys[0].id);
		}
		q.set('kind', kindFilter.value);
		q.set('status', statusFilter.value);
		q.set('pageSize', String($pageSize));
		q.set('pageIndex', String($pageIndex));
		// here I call again +page.server.ts with the new url
		goto(`?${q}`, { noScroll: true });
	});
</script>

<div class="my-2 flex items-end gap-2">
	<div class="flex flex-col gap-2">
		<Label for="kindFilter">Kind</Label>
		<Select.Root bind:selected={kindFilter}>
			<Select.Trigger class="w-[180px]">
				<Select.Value placeholder="Filter kind" />
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					{#each kinds as kind}
						<Select.Item value={kind.value} label={kind.label}>{kind.label}</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
			<Select.Input name="kindFilter" />
		</Select.Root>
	</div>
	<div class="flex flex-col gap-2">
		<Label for="statusFilter">Status</Label>
		<Select.Root bind:selected={statusFilter}>
			<Select.Trigger class="w-[180px]">
				<Select.Value placeholder="Filter status" />
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					{#each statuses as status}
						<Select.Item value={status.value} label={status.label}>{status.label}</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
			<Select.Input name="statusFilter" />
		</Select.Root>
	</div>
</div>

<div class="rounded-md border">
	<Table.Root {...$tableAttrs}>
		<Table.Header>
			{#each $headerRows as headerRow}
				<Subscribe rowAttrs={headerRow.attrs()}>
					<Table.Row>
						{#each headerRow.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} props={cell.props()}>
								{#snippet children({ attrs, props })}
									<Table.Head {...attrs}>
										{#if cell.id === 'createdAt'}
											<Button variant="ghost" on:click={props.sort.toggle}>
												<Render of={cell.render()} />
												<ArrowUpDown
													class={cn(
														$sortKeys[0]?.id === cell.id && 'text-foreground',
														'ml-2 h-4 w-4'
													)}
												/>
											</Button>
										{:else}
											<Render of={cell.render()} />
										{/if}
									</Table.Head>
								{/snippet}
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Header>
		<Table.Body {...$tableBodyAttrs}>
			{#each $pageRows as row (row.id)}
				<Subscribe rowAttrs={row.attrs()}>
					{#snippet children({ rowAttrs })}
						<Table.Row
							{...rowAttrs}
							on:click={() => {
								if (row.isData()) {
									goto(`case/${row.original.kind}/${row.original.relevantId}`);
								}
							}}
							class="cursor-pointer transition-colors duration-200 ease-in-out hover:bg-gray-400/5"
						>
							{#each row.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()}>
									{#snippet children({ attrs })}
										<Table.Cell {...attrs}>
											<Render of={cell.render()} />
										</Table.Cell>
									{/snippet}
								</Subscribe>
							{/each}
						</Table.Row>
					{/snippet}
				</Subscribe>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

<div class="flex items-center justify-end space-x-4 py-4">
	<Button
		variant="outline"
		size="sm"
		on:click={() => ($pageIndex = $pageIndex - 1)}
		disabled={!$hasPreviousPage}>Previous</Button
	>
	<Button
		variant="outline"
		size="sm"
		disabled={!$hasNextPage}
		on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
	>
</div>
