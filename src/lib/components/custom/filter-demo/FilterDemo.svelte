<script lang="ts">
    import { onMount } from 'svelte';
    import * as Card from '$ui/card';
    import * as Avatar from '$ui/avatar';
    import { fly, fade } from 'svelte/transition';
    import { cubicOut, circIn } from 'svelte/easing';
    import WalloAnimated from '$lib/components/custom/media/wallo-animated.svelte';

    export let messages: { text: string; isBad: boolean }[] = [
        // Bad messages
        { text: 'BUY CHEAP WATCHES HERE >>> www.scamsite.com ⌚', isBad: true },
        { text: 'FREE BITCOIN MINING!!! CLICK NOW!!! 💰', isBad: true },
        { text: 'MAKE $$$ FAST - WORK FROM HOME!!! 💵', isBad: true },
        { text: 'Hot singles in your area want to meet you 😘', isBad: true },
        { text: 'Prescriptions for cheap prices - 90% OFF!!! 💊', isBad: true },
        { text: '1000 FOLLOWERS INSTANTLY 👥', isBad: true },
        { text: "CONGRATULATIONS! You've won an iPhone 15!!! 📱", isBad: true },
        { text: 'INVEST NOW!!! 1000% GUARANTEED RETURNS!!! 📈', isBad: true },
        { text: 'Download FREE MOVIES here! No virus!!! 🎬', isBad: true },
        { text: 'URGENT: Your account needs verification NOW! ⚠️', isBad: true },
        { text: 'CLAIM YOUR $1000 GIFT CARD NOW - LIMITED!!! 🎁', isBad: true },
        { text: 'YOUR COMPUTER HAS VIRUS! CLICK HERE!!! 🦠', isBad: true },
        { text: 'LOSE 30 POUNDS IN 7 DAYS - MIRACLE PILL!!! 💪', isBad: true },
        { text: 'YOU ARE THE 1,000,000th VISITOR! CLAIM NOW! 🎯', isBad: true },
        { text: 'UNLOCK YOUR PHONE WITH THIS SECRET HACK!!! 🔓', isBad: true },

        // Good messages
        { text: 'Great post! Really enjoyed reading this. 🌟', isBad: false },
        { text: 'Thanks for sharing your insights!', isBad: false },
        { text: "Boring video, I'm unsubscribing. 💓", isBad: false },
        { text: 'Frankly I wish my name was Frank :(', isBad: false },
        { text: 'Love reading your blog, great content! 🎉', isBad: false },
        { text: 'Is this a joke?', isBad: false },
        { text: 'Looking forward to your next post! ✨', isBad: false },
        { text: 'Awesome work, unsubscribed', isBad: false },
        { text: 'This is exactly what I was looking for.', isBad: false },
        { text: '🐂 dog dog dog dog', isBad: false },
        { text: 'Loooong day at work, hahahahha 😪', isBad: false },
        { text: 'You ever get the same dream over and over?', isBad: false },
        { text: 'Love the vibess 💃', isBad: false },
        { text: 'Where did that cheese go??!!', isBad: false },
        { text: "I'm sharing this with my team - very useful!", isBad: false }
    ];

    const names = [
        'jsmith42',
        'coolcat99',
        'dchen99',
        'pixie42',
        'mahmed',
        'starfish8',
        'cgarcia',
        'ninja007',
        'wzhang',
        'spatel',
        'mjohnson',
        'asantos',
        'dragon123',
        'lnguyen',
        'janderson',
        'psingh',
        'tharris',
        'sunshine5',
        'krobinson',
        'ytanaka',
        'epopov',
        'sbaker',
        'moonwalk',
        'dmartin',
        'mpark',
        'mrossi',
        'rclark',
        'jhernandez',
        'mpatel',
        'wjones'
    ];

    let uncheckedCards: {
        id: number;
        text: string;
        name: string;
        position: number;
        isBad: boolean;
        showScanLine: boolean;
        startedScan: boolean;
    }[] = [];

    let nextId = 0;
    const CARD_WIDTH = 250; // Width of card
    const CARD_MARGIN = 20; // Margin between cards
    const CARD_HEIGHT = 130; // Height of card
    const MAX_CARDS = 8;

    let walloPosition: [number, number] = [0, 0];

    let recentlyUsedMessages: string[] = [];
    let recentlyUsedNames: string[] = [];
    const REPEAT_PREVENTION_COUNT = 6;

    let animationPaused = false;

    function addCard() {
        if (uncheckedCards.length >= MAX_CARDS) return;

        // Check last two messages to prevent 3 in a row
        const lastTwo = uncheckedCards.slice(-2);
        let forcedType: boolean | null = null;

        if (lastTwo.length === 2 && lastTwo[0].isBad === lastTwo[1].isBad) {
            // Force the opposite type if we have two of the same
            forcedType = !lastTwo[0].isBad;
        }

        // Filter messages to only those matching our forced type (if any) and not recently used
        const availableMessages = messages.filter(
            (m) =>
                !recentlyUsedMessages.includes(m.text) &&
                (forcedType === null || m.isBad === forcedType)
        );

        // Filter names that haven't been recently used
        const availableNames = names.filter((n) => !recentlyUsedNames.includes(n));

        if (availableMessages.length === 0 || availableNames.length === 0) {
            console.warn('Not enough unique messages or names available');
            return;
        }

        const messageIndex = Math.floor(Math.random() * availableMessages.length);
        const selectedMessage = availableMessages[messageIndex];
        const selectedName = availableNames[Math.floor(Math.random() * availableNames.length)];

        // Update recently used messages
        recentlyUsedMessages.push(selectedMessage.text);
        if (recentlyUsedMessages.length > REPEAT_PREVENTION_COUNT) {
            recentlyUsedMessages.shift();
        }

        // Update recently used names
        recentlyUsedNames.push(selectedName);
        if (recentlyUsedNames.length > REPEAT_PREVENTION_COUNT) {
            recentlyUsedNames.shift();
        }

        // Add new card at the leftmost position
        uncheckedCards = [
            ...uncheckedCards,
            {
                id: nextId++,
                text: selectedMessage.text,
                position: uncheckedCards.length,
                isBad: selectedMessage.isBad,
                name: selectedName,
                showScanLine: false,
                startedScan: false
            }
        ];
    }

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    async function animationLoop() {
        if (animationPaused) return;
        if (uncheckedCards.length < MAX_CARDS) {
            addCard();
            await delay(150);
            animationLoop();
            return;
        }
        const oldestCard = uncheckedCards[0];
        oldestCard.showScanLine = true;
        oldestCard.startedScan = true;
        // scan the card for 800 ms
        await delay(1000);

        // if oldest card isBad, remove it
        if (uncheckedCards[0].isBad) {
            // remove oldest card
            uncheckedCards = uncheckedCards.slice(1);
            await delay(400);
            // move cards forward
            uncheckedCards = uncheckedCards.map((card) => ({
                ...card,
                position: card.position - 1
            }));
            await delay(1000);
        }
        // if oldest card is notBad, move wallo down, then remove oldest card
        else {
            walloPosition[1] = CARD_HEIGHT * 1.2;
            walloPosition[0] = -20;
            await delay(500);
            uncheckedCards = uncheckedCards.slice(1);
            // move cards forward
            await delay(500);
            uncheckedCards = uncheckedCards.map((card) => ({
                ...card,
                position: card.position - 1
            }));
            await delay(300);
            walloPosition[1] = 0;
            walloPosition[0] = 0;
            await delay(1000);
        }

        // add a new card
        addCard();
        animationLoop();
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            animationPaused = true;
        } else {
            // Reset positions and state when becoming visible
            walloPosition = [0, 0];
            animationPaused = false;
            animationLoop();
        }
    }

    onMount(() => {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        animationLoop();

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    });
</script>

<div class="relative h-[250px] w-full">
    {#each uncheckedCards as card (card.id)}
        <div
            class="absolute transition-all duration-1000 ease-in-out"
            style="right:calc({card.position * (CARD_WIDTH + CARD_MARGIN)}px + 30%);"
            out:fly={{
                x: card.isBad ? 0 : window.innerWidth,
                y: card.isBad ? CARD_HEIGHT * 1.0 : 0,
                duration: 1000,
                opacity: card.isBad ? 0 : 1,
                easing: card.isBad ? cubicOut : circIn
            }}
            in:fly={{
                y: -150,
                duration: 1000
            }}
        >
            <div class="relative overflow-hidden rounded-lg {card.isBad && card.startedScan ? 'bad-container' : ''}">
                {#if card.showScanLine}
                    <div
                        class="absolute w-full h-[5px] bg-red-500/50 scan-line"
                        out:fade
                        on:animationend={() => (card.showScanLine = false)}
                    ></div>
                {/if}
                <Card.Root
                    class="bg-primary/5"
                    style="width: {CARD_WIDTH}px; height: {CARD_HEIGHT}px;"
                >
                    <Card.Header class="p-3">
                        <div class="flex flex-row items-center space-x-2">
                            <Avatar.Root>
                                <Avatar.Image src="profile-pics/avatar.png"/>
                                <Avatar.Fallback>pic</Avatar.Fallback>
                            </Avatar.Root>
                            <Card.Title class="text-[20px] font-medium">{card.name}</Card.Title>
                        </div>
                    </Card.Header>
                    <Card.Content class="pt-0">
                        <p class="text-sm font-medium">{card.text}</p>
                    </Card.Content>
                </Card.Root>
            </div>
        </div>
    {/each}
    <div
        class="absolute transition-all duration-1000 ease-in-out"
        style="transform: scaleX(-1) translate({walloPosition[0]}px, {walloPosition[1]}px);
                left: 70%; top:-30px; pointer-events: none;"
    >
        <div class="wallo-float">
            <WalloAnimated height={`${CARD_HEIGHT * 1.4}px`} />
        </div>
    </div>
</div>

<style>
    .wallo-float {
        animation: float 5s ease-in-out infinite;
    }

    @keyframes float {
        0%,
        100% {
            transform: translate(0, 0);
        }
        50% {
            transform: translate(-30px, 30px);
        }
    }

    .scan-line {
        animation: scan 0.8s ease-in-out forwards;
        box-shadow: 0 0 10px rgb(239 68 68);
    }

    @keyframes scan {
        0% {
            top: 0;
        }
        100% {
            top: 100%;
        }
    }

    .bad-container {
        animation: scan-box 0.8s ease-in-out forwards;
    }

    @keyframes scan-box {
        0% {
            background-color: rgba(255, 0, 0, 0);
        }
        100% {
            background-color: rgba(255, 0, 0, 0.25);
        }
    }
</style>
