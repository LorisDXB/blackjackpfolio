import { useEffect, useRef, useState } from "react";
import "../components/Dealer/Dealer.css"
import { sleep } from "../utility/utility";

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
    // const dealerOccupied = useRef<boolean>(false);
    const lastTransform = useRef<{ dx: number; dy: number } | null>(null);

    useEffect(() => {
        playDefaultAnimation();
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

    return {
        dealerRef,
        playDefaultAnimation,
        playGiveCardAnimation,
        playReturnAnimation,
        // dealerOccupied,
        dealerSpotRef,
        playerSpotRef,
        resetAnimator
    }
}