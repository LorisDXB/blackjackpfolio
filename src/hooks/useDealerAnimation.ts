import { useEffect, useRef, useState } from "react";
import "../components/Dealer/Dealer.css"
import { sleep } from "../utility/utility";
import dealerIdle from '../assets/dealer-idle.png';
import dealerGrab from '../assets/dealer-grab.png';
import dealerTwitch from '../assets/dealer-twitch.png';

export enum DealerAnimState {
    IDLE,
    GRAB,
    TWITCH
}

const DEALER_IMAGES: Record<DealerAnimState, string> = {
    [DealerAnimState.IDLE]: `url(${dealerIdle})`,
    [DealerAnimState.GRAB]: `url(${dealerGrab})`,
    [DealerAnimState.TWITCH]: `url(${dealerTwitch})`,
};

enum DealerAnimation {
    IDLE,
    GIVINGCARD
};

const cssDealerAnimationList = [
    "dealer-idle-anim",
]

export function useDealerAnimator(dealerPlaying: boolean) {
    const dealerRef = useRef<HTMLDivElement | null>(null); // set on init
    const playerSpotRef = useRef<HTMLDivElement | null>(null); // set when card needs to be given
    const dealerSpotRef = useRef<HTMLDivElement | null>(null); // set when card needs to be given
    const cvSpotRef = useRef<HTMLDivElement | null>(null); // set when card needs to be given
    // const dealerOccupied = useRef<boolean>(false);
    const lastTransform = useRef<{ dx: number; dy: number } | null>(null);
    const twitchTimeout = useRef<number | null>(null);

    useEffect(() => {
        playDefaultAnimation();
        startRandomTwitching();
    }, []);

    function resetAnimator() {
        // dealerRef.current = null;
        playerSpotRef.current = null;
        dealerSpotRef.current = null;
        // dealerOccupied.current = false;
        lastTransform.current = null;
    }

    function clearAnimations() {
        if (!dealerRef.current) return;
        cssDealerAnimationList.forEach((animToRemove) => {
            if (!dealerRef.current) return;

            dealerRef.current.classList.remove(animToRemove);
        })
        dealerRef.current.getAnimations().forEach(a => a.cancel());
    }

    function playDefaultAnimation() {
        if (!dealerRef.current) return;

        dealerRef.current.classList.add("dealer-idle-anim");
    }

    function playReturnAnimation(forward?: boolean): Promise<null> {
        return new Promise(async (res) => {
            const cardSpotRef = dealerPlaying ? dealerSpotRef.current : playerSpotRef.current;
            // if (!dealerRef.current || !cardSpotRef || dealerOccupied.current) {
            if (!dealerRef.current || !cardSpotRef) {
                res(null);
                return;
            }

            const dealer = dealerRef.current;

            const t = lastTransform.current;
            if (!t) return;

            // dealerOccupied.current = true;
            dealer.animate(
                [
                    { transform: `translate(${t.dx}px, ${t.dy}px)` },
                    { transform: "translate(0, 0)" }
                ],
                { duration: 800, easing: "ease", fill: forward ? "forwards" : "none" }
            ).onfinish = () => {
                if (forward)
                    clearAnimations();
                // dealerOccupied.current = false;
                res(null);
            }
        });
    }

    function playGiveCardAnimation(forward?: boolean): Promise<null> {
        return new Promise(async (res) => {
            const cardSpotRef = dealerPlaying ? dealerSpotRef.current : playerSpotRef.current;
            // if (!dealerRef.current || !cardSpotRef || dealerOccupied.current) {
            if (!dealerRef.current || !cardSpotRef) {
                res(null);
                return;
            }

            const dealer = dealerRef.current;

            const dealerRect = dealerRef.current.getBoundingClientRect();
            const targetRect = cardSpotRef.getBoundingClientRect();

            const dx = targetRect.left - dealerRect.left;
            const dy = targetRect.top - dealerRect.top;

            lastTransform.current = { dx, dy };

            // dealerOccupied.current = true;

            dealer.animate(
                [
                    { transform: "translate(0, 0)" },
                    { transform: `translate(${dx}px, ${dy}px)` }
                ],
                { duration: 800, easing: "ease", fill: forward ? "forwards" : "none" }
            ).onfinish = () => {
                res(null);
                // dealerOccupied.current = false;
                return;
            };
        });
    }

    function playGiveCvAnimation(forward?: boolean): Promise<null> {
        return new Promise(async (res) => {
            const elemRef = cvSpotRef.current;
            // if (!dealerRef.current || !cardSpotRef || dealerOccupied.current) {
            if (!dealerRef.current || !elemRef) {
                res(null);
                return;
            }

            const dealer = dealerRef.current;

            const dealerRect = dealerRef.current.getBoundingClientRect();
            const targetRect = elemRef.getBoundingClientRect();

            const dx = targetRect.left - dealerRect.left;
            const dy = targetRect.top - dealerRect.top;

            lastTransform.current = { dx, dy };

            // dealerOccupied.current = true;

            dealer.animate(
                [
                    { transform: "translate(0, 0)" },
                    { transform: `translate(${dx}px, ${dy}px)` }
                ],
                { duration: 800, easing: "ease", fill: forward ? "forwards" : "none" }
            ).onfinish = () => {
                res(null);
                // dealerOccupied.current = false;
                return;
            };
        });
    }

    function setDealerImage(ref: React.RefObject<HTMLDivElement | null>, img: string) {
        if (!ref.current) return;
        ref.current.style.backgroundImage = `url(${img})`;
    }

    async function twitchDealer() {
        if (!dealerRef.current) return;

        setDealerImage(dealerRef, dealerTwitch);

        const duration = Math.floor(Math.random() * 150) + 50; // 50–200ms
        await sleep(duration);

        setDealerImage(dealerRef, dealerIdle);
    }

    async function grabDealer() {
        if (!dealerRef.current) return;

        stopRandomTwitching();
        setDealerImage(dealerRef, dealerGrab);
        await sleep(100);
        setDealerImage(dealerRef, dealerIdle);
        startRandomTwitching();
    }

    function stopRandomTwitching() {
        if (twitchTimeout.current !== null) {
            clearTimeout(twitchTimeout.current);
            twitchTimeout.current = null;
        }
    }

    function startRandomTwitching() {
        stopRandomTwitching(); // safety

        const schedule = async () => {
            const delay = Math.random() * 3000 + 500; // 2–6 seconds
            twitchTimeout.current = window.setTimeout(async () => {
                await twitchDealer();
                schedule(); // schedule next one
            }, delay);
        };

        schedule();
    }


    return {
        dealerRef,
        playDefaultAnimation,
        playGiveCardAnimation,
        playReturnAnimation,
        playGiveCvAnimation,
        // dealerOccupied,
        dealerSpotRef,
        cvSpotRef,
        playerSpotRef,
        resetAnimator,
        grabDealer,
        twitchDealer
    }
}