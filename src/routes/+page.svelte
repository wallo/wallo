<script lang="ts">
    import { Button } from '$ui/button';
    import ThemeSwitch from '$ui/theme-switch/theme-switch.svelte';
    import type { PageData } from './$types';
    import { signIn } from '@auth/sveltekit/client';
    import Logo from '$lib/components/custom/media/logo.svelte';
    import * as Card from '$ui/card';
    import * as Avatar from '$ui/avatar';
    import Highlight from 'svelte-highlight';
    import typescript from 'svelte-highlight/languages/typescript';
    import { default as lightTheme } from 'svelte-highlight/styles/a11y-light';
    import { default as darkTheme } from 'svelte-highlight/styles/a11y-dark';
    import { mode } from 'mode-watcher';
    import { onMount } from 'svelte';
    import { json } from 'svelte-highlight/languages';
    import MediaDisplay from './dashboard/platform/[platformId]/case/[kindId]/[caseId]/MediaDisplay.svelte';
    import { GitlabIcon } from 'lucide-svelte';
    import FilterDemo from '$lib/components/custom/filter-demo/FilterDemo.svelte';

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();

    function splitmix32(a: number) {
        return function () {
            a |= 0;
            a = (a + 0x9e3779b9) | 0;
            let t = a ^ (a >>> 16);
            t = Math.imul(t, 0x21f0aaad);
            t = t ^ (t >>> 15);
            t = Math.imul(t, 0x735a2d97);
            return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
        };
    }

    function generateRandomBadWord(seed: number, length: number): string {
        const getRandomInt = splitmix32(seed);
        const censoredLetters = '$%#@!*';
        return Array.from({ length }, () =>
            censoredLetters.charAt(Math.floor(getRandomInt() * censoredLetters.length))
        ).join('');
    }

    let randomSeed = $state(0);

    onMount(() => {
        const interval = setInterval(() => {
            randomSeed = randomSeed + 1;
        }, 40);

        return () => clearInterval(interval);
    });

    let currentRandomBadWord = $derived((x: number, length: number) =>
        generateRandomBadWord(randomSeed + x, length)
    );

    let demoStatement = $derived(`What does the fox say? ${currentRandomBadWord(0, 4)}`);

    let actionTaken: 'approve' | 'unapprove' | 'unreject' | 'reject' | null = $state(null);
</script>

<svelte:head>
    {#if $mode === 'dark'}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html darkTheme}
    {:else}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html lightTheme}
    {/if}
</svelte:head>

<div class="relative overflow-hidden">
    <header
        class="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full backdrop-blur-sm"
    >
        <nav class="container flex max-w-(--breakpoint-2xl) items-center gap-2 py-2">
            <a class="flex items-center gap-1 text-2xl font-extrabold" href="/">
                <Logo></Logo>
                Wallo
            </a>
            <div class="ms-auto flex">
                <Button variant="ghost" size="icon" href="https://gitlab.com/wallo-dev/wallo">
                    <GitlabIcon class="h-[1.2rem] w-[1.2rem]" />
                </Button>
                <ThemeSwitch></ThemeSwitch>
            </div>
            <div>
                {#if data.session}
                    <Button size="sm" variant="outline" href="/dashboard">Dashboard</Button>
                {:else}
                    <Button
                        size="sm"
                        variant="outline"
                        onclick={() =>
                            signIn(undefined, {
                                callbackUrl: '/dashboard'
                            })}>Login</Button
                    >
                {/if}
            </div>
        </nav>
    </header>

    <main class="container flex flex-col items-center justify-center gap-4">
        <section
            class="flex flex-col items-center justify-center gap-2 py-8 pb-8 md:py-12 md:pb-8 lg:py-24 lg:pb-0"
        >
            <h1
                class="max-w-[1000px] text-center text-3xl leading-tight font-bold tracking-tighter md:text-6xl lg:leading-[1.1]"
            >
                The content moderation platform you've been waiting for.
            </h1>
            <p class="text-muted-foreground text-center text-lg text-balance sm:text-2xl">
                Ergonomic, AI Powered, Open-Source.
            </p>
            <div class="md-10 flex gap-4 py-4">
                <Button href="/dashboard">Get Started</Button>
                <Button variant="outline" href="https://gitlab.com/wallo-dev/wallo"
                    >Source Code</Button
                >
            </div>
            <p class="bg-muted mb-10 rounded-lg px-3 py-1 text-center text-sm font-medium">
                Wallo is under active development
            </p>
        </section>
        <FilterDemo></FilterDemo>
        <section class="my-4 flex flex-col items-center justify-center">
            <h2 class="mb-8 text-3xl font-bold">Features</h2>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Ergonomic</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <Card.Description>
                            Our simple API makes it easy to integrate Wallo with your platform.
                        </Card.Description>
                    </Card.Content>
                </Card.Root>
                <Card.Root>
                    <Card.Header>
                        <Card.Title>AI Powered</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <Card.Description>
                            Coming Soon: Use Wallo AI to simplify moderation.
                        </Card.Description>
                    </Card.Content>
                </Card.Root>
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Open-Source</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <Card.Description>
                            Wallo is open-source, allowing for transparency and community
                            contribution.
                        </Card.Description>
                    </Card.Content>
                </Card.Root>
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Real-time Moderation</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <Card.Description>
                            Subscribe to real-time updates for immediate moderation actions.
                        </Card.Description>
                    </Card.Content>
                </Card.Root>
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Customizable</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <Card.Description>
                            Customize moderation settings and rules to fit your platform's needs.
                        </Card.Description>
                    </Card.Content>
                </Card.Root>
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Community Support</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <Card.Description
                            >Join our community for support and collaboration.</Card.Description
                        >
                    </Card.Content>
                </Card.Root>
            </div>
        </section>
        <section class="my-8 flex w-full flex-col items-center justify-center">
            <h2 class="mb-8 text-3xl font-bold">How It Works</h2>
            <section class="flex w-full gap-4">
                <div class="flex h-auto flex-col items-center justify-center">
                    <Card.Root>
                        <Card.Title class="p-2">1</Card.Title>
                    </Card.Root>
                    <!-- bar that extends to the bottom -->
                    <div class="w-1 flex-1 bg-[hsl(var(--border))]"></div>
                </div>
                <div class="mb-4 flex flex-1 flex-wrap items-start justify-between gap-4">
                    <div class="min-w-48 flex-1">
                        <h3 class="text-2xl font-semibold">
                            User posts something on your platform
                        </h3>

                        <p class="py-2">
                            This can be a social media post, a comment, a review, or any other
                            user-generated content.
                        </p>
                    </div>
                    <Card.Root class="flex-1">
                        <Card.Header>
                            <div class="flex items-center gap-3 text-lg font-medium">
                                <Avatar.Root>
                                    <Avatar.Image
                                        src="https://images.opencollective.com/yichen-gao/8ddd996/avatar/256.png?height=64"
                                        alt="User Avatar"
                                    />
                                    <Avatar.Fallback>PU</Avatar.Fallback>
                                </Avatar.Root>
                                <div class="flex flex-col gap-0.5">
                                    <span class="text-sm font-semibold"> Yichen </span>
                                    <span class="text-sm text-gray-500"> 2 hours ago </span>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Content>
                            <Card.Description class="font-mono">
                                {demoStatement}
                            </Card.Description>
                        </Card.Content>
                    </Card.Root>
                </div>
            </section>
            <section class="flex w-full gap-4">
                <div class="flex h-auto flex-col items-center justify-center">
                    <Card.Root>
                        <Card.Title class="p-2">2</Card.Title>
                    </Card.Root>
                    <!-- bar that extends to the bottom -->
                    <div class="w-1 flex-1 bg-[hsl(var(--border))]"></div>
                </div>
                <div class="mb-4 flex flex-1 flex-wrap justify-between gap-4 overflow-hidden">
                    <div class="min-w-48 flex-1">
                        <h3 class="text-2xl font-semibold">
                            Your platform sends an API request to Wallo
                        </h3>
                        <p class="py-2">
                            This can be done if someone reports the content or if you have automated
                            moderation in place.
                        </p>
                    </div>
                    <Card.Root class="w-full flex-1">
                        <Highlight
                            language={typescript}
                            code={String.raw`
fetch('https://wallo.dev/api/v1/publish', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer ' + YOUR_ACCESS_TOKEN,
	},
	body: JSON.stringify({
		subjectId: postId,
		subjectKind: 'content',
		platformId: env.PLATFORM_ID,
	})
});`.trimStart()}
                        />
                    </Card.Root>
                </div>
            </section>
            <section class="flex w-full gap-4">
                <div class="flex h-auto flex-col items-center justify-center">
                    <Card.Root>
                        <Card.Title class="p-2">3</Card.Title>
                    </Card.Root>
                    <!-- bar that extends to the bottom -->
                    <div class="w-1 flex-1 bg-[hsl(var(--border))]"></div>
                </div>
                <div class="mb-4 flex flex-1 flex-wrap justify-between gap-4 overflow-hidden">
                    <div class="min-w-48 flex-1">
                        <h3 class="text-2xl font-semibold">
                            Wallo retrieves the content from your platform
                        </h3>
                        <p class="py-2">
                            This is only done when a moderator needs to take action on the content.
                            In the future, this can be configured to be done automatically to make
                            moderation faster.
                        </p>
                    </div>
                    <Card.Root class="w-full flex-1">
                        <Highlight
                            language={typescript}
                            code={String.raw`
fetch(YOUR_PLATFORM, {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer ' + YOUR_ACCESS_TOKEN,
	},
	body: JSON.stringify({
		subjectId: postId,
		subjectKind: 'content',
	}),
});
`.trimStart()}
                        />
                    </Card.Root>
                </div>
            </section>
            <section class="flex w-full gap-4">
                <div class="flex h-auto flex-col items-center justify-center">
                    <Card.Root>
                        <Card.Title class="p-2">4</Card.Title>
                    </Card.Root>
                    <!-- bar that extends to the bottom -->
                    <div class="w-1 flex-1 bg-[hsl(var(--border))]"></div>
                </div>
                <div class="mb-4 flex flex-1 flex-wrap justify-between gap-4 overflow-hidden">
                    <div class="min-w-48 flex-1">
                        <h3 class="text-2xl font-semibold">
                            Your platform responds with the relevant information.
                        </h3>
                        <p class="py-2">
                            This can include the content itself, the user who posted it, and the
                            possible actions that can be taken.
                        </p>
                    </div>
                    <Card.Root class="w-full flex-1">
                        <Highlight
                            language={json}
                            code={String.raw`{
	"medias": [{
		kind: "text",
		message: "` +
                                demoStatement +
                                String.raw`"
	}],
	"possibleActions": [{
		id: "approve",
		display: "Approve",
	}, {
		id: "reject",
		display: "Reject",
		variant: "destructive",
	}],
}`.trim()}
                        />
                    </Card.Root>
                </div>
            </section>
            <section class="flex w-full gap-4">
                <div class="flex h-auto flex-col items-center">
                    <Card.Root>
                        <Card.Title class="p-2">5</Card.Title>
                    </Card.Root>
                </div>
                <div class="mb-4 flex flex-1 flex-wrap justify-between gap-4 overflow-hidden">
                    <div class="min-w-48 flex-1">
                        <h3 class="text-2xl font-semibold">The moderator takes action</h3>
                        <p class="py-2">
                            The moderator can approve or reject the content based on the platform's
                            guidelines. Then Wallo will notify your platform of the action taken.
                        </p>
                    </div>
                    <div class="flex w-full min-w-60 flex-1 flex-col gap-4">
                        {#if actionTaken !== null}
                            <Card.Root class="flex flex-col gap-4 p-4">
                                <Card.Root>
                                    <Highlight
                                        language={typescript}
                                        code={String.raw`fetch(YOUR_PLATFORM, {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer ' + YOUR_ACCESS_TOKEN,
	},
	body: JSON.stringify({
		subjectId: postId,
		subjectKind: 'content',
		action: '` +
                                            actionTaken +
                                            String.raw`'
	}),
});`.trimStart()}
                                    />
                                </Card.Root>
                                <div class="flex w-full gap-4">
                                    {#if actionTaken === 'approve' || actionTaken === 'unreject'}
                                        <Button
                                            class="flex-1"
                                            variant="destructive"
                                            onclick={() => {
                                                actionTaken = 'unapprove';
                                            }}
                                        >
                                            Unapprove
                                        </Button>
                                    {:else}
                                        <Button
                                            class="flex-1"
                                            variant="destructive"
                                            onclick={() => {
                                                actionTaken = 'unreject';
                                            }}
                                        >
                                            Unreject
                                        </Button>
                                    {/if}
                                </div>
                            </Card.Root>
                        {:else}
                            <Card.Root class="flex flex-col gap-4 p-4 font-mono">
                                <MediaDisplay
                                    medias={[
                                        {
                                            kind: 'text',
                                            message: 'Yichen',
                                            tag: 'User Name'
                                        },
                                        {
                                            kind: 'image',
                                            url: 'https://images.opencollective.com/yichen-gao/8ddd996/avatar/256.png?height=128',
                                            alt: 'User Avatar',
                                            tag: 'User Avatar'
                                        },
                                        {
                                            kind: 'text',
                                            message: '2 hours ago',
                                            tag: 'Date'
                                        },
                                        {
                                            kind: 'text',
                                            message: demoStatement,
                                            tag: 'Content'
                                        }
                                    ]}
                                ></MediaDisplay>
                                <div class="flex w-full gap-4">
                                    <Button
                                        class="flex-1"
                                        onclick={() => {
                                            actionTaken = 'approve';
                                        }}>Approve</Button
                                    >
                                    <Button
                                        class="flex-1"
                                        variant="destructive"
                                        onclick={() => {
                                            actionTaken = 'reject';
                                        }}>Reject</Button
                                    >
                                </div>
                            </Card.Root>
                        {/if}
                    </div>
                </div>
            </section>
        </section>
        <section class="my-8 flex w-full flex-col items-center justify-center">
            <h2 class="mb-8 text-3xl font-bold">Pricing</h2>
            <div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Free</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <Card.Description>
                            <ul class="list-inside list-disc">
                                <li>Up to 10000 requests per month</li>
                                <li>Basic moderation features</li>
                                <li>Community support</li>
                            </ul>
                        </Card.Description>
                    </Card.Content>
                    <Card.Footer>
                        <Button variant="outline" href="/dashboard">Get Started</Button>
                    </Card.Footer>
                </Card.Root>
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Enterprise</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <Card.Description>
                            <ul class="list-inside list-disc">
                                <li>Custom requests</li>
                                <li>Custom moderation features</li>
                                <li>24/7 support</li>
                            </ul>
                        </Card.Description>
                    </Card.Content>
                    <Card.Footer>
                        <Button variant="outline" href="mailto:sales@wallo.dev"
                            >Contact Sales</Button
                        >
                    </Card.Footer>
                </Card.Root>
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Self-hosted</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <Card.Description>
                            <ul class="list-inside list-disc">
                                <li>Unlimited requests</li>
                                <li>Full control over data</li>
                                <li>Customizable moderation rules</li>
                            </ul>
                        </Card.Description>
                    </Card.Content>
                    <Card.Footer>
                        <Button variant="outline" href="https://gitlab.com/wallo-dev/wallo">
                            Get Source Code
                        </Button>
                    </Card.Footer>
                </Card.Root>
            </div>
        </section>
    </main>
    <footer class="border-t py-6">
        <p class="container text-center text-sm">
            © {new Date().getFullYear()} Wallo. All rights reserved.
        </p>
    </footer>
</div>
