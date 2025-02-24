<script lang="ts">
    import { zip, type Rule } from '$lib/types';
    import * as Card from '$ui/card';
    import EditRuleForm from './EditRuleForm.svelte';
    import { type SuperValidated, type Infer } from 'sveltekit-superforms';
    import type { ArchiveRuleSchema, EditRuleSchema, CreateRuleSchema } from './rules-schema';
    import NewRuleForm from './NewRuleForm.svelte';
    import * as Accordion from '$ui/accordion';

    interface Props {
        data: Rule[];
        platformId: string;
        forms: {
            edit: SuperValidated<Infer<EditRuleSchema>>[];
            archive: SuperValidated<Infer<ArchiveRuleSchema>>[];
            create: SuperValidated<Infer<CreateRuleSchema>>;
        };
    }

    let { data, forms }: Props = $props();

    let activeRules = data.filter((rule) => rule.active);
    let inactiveRules = data.filter((rule) => !rule.active);

    let activeForms = zip(data, forms.edit, forms.archive).filter(([data]) =>
        activeRules.some((rule) => rule.ruleId === data.ruleId)
    );
    let inactiveForms = zip(data, forms.edit, forms.archive).filter(([data]) =>
        inactiveRules.some((rule) => rule.ruleId === data.ruleId)
    );
</script>

<Card.Root>
    <Card.Header>
        <Card.Title class="flex items-center justify-between">
            Ruleset
            <NewRuleForm create={forms.create} />
        </Card.Title>
        <Card.Description>Define the rules for your platform</Card.Description>
    </Card.Header>
    <Card.Content>
        {#if activeRules.length > 0}
            <Accordion.Root type="single" class="w-full">
                {#each activeForms as [rule, editForm, archiveForm] (editForm.data.ruleId)}
                    <EditRuleForm {rule} edit={editForm} archive={archiveForm} isArchived={false} />
                {/each}
            </Accordion.Root>
        {:else}
            <p class="text-gray-500">No rules have been defined yet.</p>
        {/if}
    </Card.Content>
</Card.Root>

{#if inactiveRules.length > 0}
    <Card.Root>
        <Card.Header>
            <Card.Title class="flex items-center justify-between">Inactive Rules</Card.Title>
            <Card.Description>Rules that are no longer active</Card.Description>
        </Card.Header>
        <Card.Content>
            <Accordion.Root type="single" class="w-full">
                {#each inactiveForms as [rule, editForm, archiveForm] (editForm.data.ruleId)}
                    <EditRuleForm {rule} edit={editForm} archive={archiveForm} isArchived={true} />
                {/each}
            </Accordion.Root>
        </Card.Content>
    </Card.Root>
{/if}
