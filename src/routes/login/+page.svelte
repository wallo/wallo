<script lang="ts">
    import google from '$lib/brands/google.svg';
    import githubLight from '$lib/brands/github-light.svg';
    import githubDark from '$lib/brands/github-dark.svg';
    import gitlab from '$lib/brands/gitlab.svg';
    import { Button } from '$ui/button';
    import * as Card from '$ui/card';
    import type { PageData } from './$types';
    import Logo from '$lib/components/custom/media/logo.svelte';
    import { signIn } from '@auth/sveltekit/client';
    import { page } from '$app/state';
    import * as Alert from '$ui/alert';
    import { CircleAlert } from 'lucide-svelte';
    import type { SignInPageErrorParam } from '@auth/core/types';

    let { data }: { data: PageData } = $props();

    let error = $derived(page.url.searchParams.get('error'));

    const signinErrors: Record<SignInPageErrorParam | 'default', string> = {
        default: 'Unable to sign in.',
        Signin: 'Try signing in with a different account.',
        OAuthSignin: 'Try signing in with a different account.',
        OAuthCallbackError: 'Try signing in with a different account.',
        OAuthCreateAccount: 'Try signing in with a different account.',
        EmailCreateAccount: 'Try signing in with a different account.',
        Callback: 'Try signing in with a different account.',
        OAuthAccountNotLinked:
            'To confirm your identity, sign in with the same account you used originally.',
        EmailSignin: 'The e-mail could not be sent.',
        CredentialsSignin: 'Sign in failed. Check the details you provided are correct.',
        SessionRequired: 'Please sign in to access this page.'
    };
</script>

<div class="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
    <div class="flex w-full max-w-sm flex-col gap-6">
        <a class="flex items-center justify-center gap-1 text-2xl font-extrabold" href="/">
            <Logo></Logo>
            Wallo
        </a>
        <div class="flex flex-col gap-6">
            <Card.Root class="mx-auto max-w-sm">
                <Card.Header>
                    <Card.Title class="text-center text-2xl">Login</Card.Title>
                    <Card.Description class="text-center">
                        Or register with one of the following services
                    </Card.Description>
                </Card.Header>
                <Card.Content>
                    {#if error}
                        <Alert.Root variant="destructive" class="mb-4">
                            <CircleAlert class="size-4" />
                            <Alert.Title>Error: {error}</Alert.Title>
                            <Alert.Description>
                                {signinErrors[error as SignInPageErrorParam] ??
                                    signinErrors.default}
                            </Alert.Description>
                        </Alert.Root>
                    {/if}
                    <div class="grid gap-4">
                        {#each data.providerMap as provider}
                            <Button
                                variant="outline"
                                class="w-full"
                                onclick={() => signIn(provider.id, { callbackUrl: '/dashboard' })}
                            >
                                {#if provider.id === 'google'}
                                    <img src={google} alt="Google" class="h-4 w-4" />
                                {:else if provider.id === 'github'}
                                    <img
                                        src={githubLight}
                                        alt="GitHub"
                                        class="h-4 w-4 not-dark:hidden"
                                    />
                                    <img
                                        src={githubDark}
                                        alt="GitHub"
                                        class="h-4 w-4 dark:hidden"
                                    />
                                {:else if provider.id === 'gitlab'}
                                    <img src={gitlab} alt="GitLab" class="h-4 w-4" />
                                {/if}
                                Continue with {provider.name}
                            </Button>
                        {/each}
                    </div>
                </Card.Content>
            </Card.Root>
            <div
                class="text-muted-foreground hover:[&_a]:text-primary text-center text-xs text-balance [&_a]:underline [&_a]:underline-offset-4"
            >
                By clicking continue, you agree to our <a href="/tos">Terms of Service</a>{' '}
                and <a href="/privacy">Privacy Policy</a>.
            </div>
        </div>
    </div>
</div>
