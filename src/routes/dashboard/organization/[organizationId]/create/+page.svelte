<script lang="ts">
    import type { PageData } from './$types';
    import CreateForm from './CreateForm.svelte';

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

<CreateForm data={data.form}></CreateForm>
