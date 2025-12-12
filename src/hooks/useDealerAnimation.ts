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

export function useDealerAnimator()
{
    const dealerRef = useRef<HTMLDivElement | null>(null); // set on init
    const cardSpotRef = useRef<HTMLDivElement | null>(null); // set when card needs to be given
    const [dealerOccupied, setDealerOccupied] = useState<boolean>(false);

    useEffect(() => {
        playDefaultAnimation();
    }, [dealerRef]);

    function clearAnimations() {
        cssDealerAnimationList.forEach((animToRemove) => {
            if (!dealerRef.current) return;

            dealerRef.current.classList.remove(animToRemove);
        })
    }

    function playDefaultAnimation() {
        if (!dealerRef.current) return;

        dealerRef.current.classList.add("dealer-idle-anim");
    }

    function playGiveCardAnimation(callback: () => {}) {
        if (!dealerRef.current || !cardSpotRef.current || dealerOccupied) return;


        const dealer = dealerRef.current;
        console.log(cardSpotRef.current);

        const dealerRect = dealerRef.current.getBoundingClientRect();
        const targetRect = cardSpotRef.current.getBoundingClientRect();

        const dx = targetRect.left - dealerRect.left;
        const dy = targetRect.top - dealerRect.top;


        setDealerOccupied(true);
        dealer.animate(
            [
                { transform: "translate(0, 0)" },
                { transform: `translate(${dx}px, ${dy}px)` }
            ],
            { duration: 800, easing: "ease" }
        ).onfinish = () => {
            callback();
            dealer.animate(
                [
                    { transform: `translate(${dx}px, ${dy}px)` },
                    { transform: "translate(0, 0)" }
                ],
                { duration: 800, easing: "ease" }
            ).onfinish = () => setDealerOccupied(false);
        };
    }

    return {
        dealerRef,
        cardSpotRef,
        playGiveCardAnimation
    }
}