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
    const [dealerOccupied, setDealerOccupied] = useState<boolean>(false);

    useEffect(() => {
        playDefaultAnimation();
    }, []);

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
            if (!dealerRef.current || !cardSpotRef) {
                res(null);
                return;
            }

            const dealer = dealerRef.current;
            const dealerRect = dealerRef.current.getBoundingClientRect();
            const targetRect = cardSpotRef.getBoundingClientRect();

            const dx = targetRect.left - dealerRect.left;
            const dy = targetRect.top - dealerRect.top;


            dealer.animate(
                [
                    { transform: `translate(${dx}px, ${dy}px)` },
                    { transform: "translate(0, 0)" }
                ],
                { duration: 800, easing: "ease", fill: forward ? "forwards" : "none" }
            ).onfinish = () => {
                if (forward)
                    clearAnimations();
                res(null);
            }
        });
    }

    function playGiveCardAnimation(forward?: boolean): Promise<null> {
        return new Promise(async (res) => {
            const cardSpotRef = dealerPlaying ? dealerSpotRef.current : playerSpotRef.current;
            if (!dealerRef.current || !cardSpotRef || dealerOccupied) {
                res(null);
                return;
            }

            const dealer = dealerRef.current;
            console.log(cardSpotRef);

            const dealerRect = dealerRef.current.getBoundingClientRect();
            const targetRect = cardSpotRef.getBoundingClientRect();

            const dx = targetRect.left - dealerRect.left;
            const dy = targetRect.top - dealerRect.top;


            setDealerOccupied(true);
            dealer.animate(
                [
                    { transform: "translate(0, 0)" },
                    { transform: `translate(${dx}px, ${dy}px)` }
                ],
                { duration: 800, easing: "ease", fill: forward ? "forwards" : "none" }
            ).onfinish = () => {
                res(null);
                return;
            };
        });
    }

    return {
        dealerRef,
        playDefaultAnimation,
        playGiveCardAnimation,
        playReturnAnimation,
        setDealerOccupied,
        dealerSpotRef,
        playerSpotRef
    }
}