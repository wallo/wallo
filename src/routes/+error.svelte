<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$ui/button';
</script>

<div class="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-md space-y-4 text-center">
		<h1 class="text-foreground text-6xl font-bold tracking-tight sm:text-7xl">
			{page.status}
		</h1>
		<p class="text-muted-foreground text-lg">
			{page.error?.message ?? 'An error occurred'}
		</p>
		<Button href="/" variant="secondary">Go to Homepage</Button>
	</div>
</div>
