<script lang="ts">
    import { onMount } from 'svelte';
    import * as Card from '$ui/card';
    import * as Avatar from '$ui/avatar';
    import { fly } from 'svelte/transition';
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
        { text: "Love reading your blog, great content! 🎉", isBad: false },
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
    }[] = [];

    let nextId = 0;
    const CARD_WIDTH = 250; // Width of card
    const CARD_MARGIN = 20; // Margin between cards
    const CARD_HEIGHT = 130; // Height of card
    const MAX_CARDS = 8;

    let walloPosition: [number, number] = [0, 0];
    let wobbleDelta: [number, number] = [0, 0];
    let dodgeStartTimestamp = 0;
    let isDodging = false;

    let recentlyUsedMessages: string[] = [];
    let recentlyUsedNames: string[] = [];
    const REPEAT_PREVENTION_COUNT = 6;

    let animationPaused = false;
    let addCardInterval: ReturnType<typeof setInterval>;
    let removeCardInterval: ReturnType<typeof setInterval>;
    let walloInterval: ReturnType<typeof setInterval>;

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
                name: selectedName
            }
        ];
    }

    function removeOldestCard() {
        if (uncheckedCards.length === 0) return;

        let cardToRemove = uncheckedCards[0];

        if (cardToRemove.isBad === false) {
            dodgeStartTimestamp = Date.now();
            isDodging = true;
        }

        // Remove the rightmost card (position -1)
        uncheckedCards = uncheckedCards
            .filter((card) => card.position !== 0)
            .map((card) => ({
                ...card,
                position: card.position - 1 // Shift all cards one position right
            }));
    }

    function updateWalloPosition() {
        wobbleDelta = [Math.sin(Date.now() / 1000) * 20, Math.cos(Date.now() / 723) * 10];
        if (isDodging) {
            let timeSinceDodge = Date.now() - dodgeStartTimestamp;
            // console.log(timeSinceDodge);
            const displacementValue = -(Math.cos((timeSinceDodge / 1500) * 2 * Math.PI) - 1) / 2;
            walloPosition[1] = displacementValue * CARD_HEIGHT * 1.2;
            walloPosition[0] = -displacementValue * CARD_WIDTH * 0.4;
            if (timeSinceDodge > 1500) {
                isDodging = false;
                walloPosition[1] = 0;
                walloPosition[0] = 0;
            }
        }
    }

    function startIntervals() {
        if (!animationPaused) {
            addCardInterval = setInterval(addCard, 100);
            removeCardInterval = setInterval(removeOldestCard, 2000);
            walloInterval = setInterval(updateWalloPosition, 4);
        }
    }

    function clearIntervals() {
        clearInterval(addCardInterval);
        clearInterval(removeCardInterval);
        clearInterval(walloInterval);
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            animationPaused = true;
            clearIntervals();
        } else {
            // Reset positions and state when becoming visible
            walloPosition = [0, 0];
            wobbleDelta = [0, 0];
            isDodging = false;
            animationPaused = false;
            startIntervals();
        }
    }

    onMount(() => {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        startIntervals();

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearIntervals();
        };
    });
</script>

<div class="relative h-[250px] w-full">
    {#each uncheckedCards as card (card.id)}
        <div
            class="absolute transition-all duration-1000"
            style="right:calc({card.position *
                (CARD_WIDTH + CARD_MARGIN)}px + 40%); transition-delay:800ms;"
            out:fly={{
                x: card.isBad ? 0 : window.innerWidth / 2,
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
            <Card.Root
                class={card.isBad ? 'bg-red-500/10' : 'bg-primary/5'}
                style="width: {CARD_WIDTH}px; height: {CARD_HEIGHT}px;"
            >
                <Card.Header class="pb-2 p-3">
                    <div class="flex flex-row items-center space-x-2">
                        <Avatar.Root>
                            <Avatar.Image src="profile-pics/avatar.png" />
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
    {/each}
    <div
        class="absolute transition-all duration-20"
        style="transform: scaleX(-1) translate({walloPosition[0] +
            wobbleDelta[0]}px, {walloPosition[1] + wobbleDelta[1]}px); left: 63%; top:-30px;"
    >
        <WalloAnimated height={`${CARD_HEIGHT * 1.4}px`} />
    </div>
</div>

<style>
</style>
