import React, { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useDealerAnimator } from './useDealerAnimation';
import { sleep } from '../utility/utility';
import { useDialogue } from './useDialogue';

export type CardData = {
    hidden: boolean;
    typeId: number;
}

export enum PlayerState {
    NONE,
    STANDING,
    BUSTED,
    WINNER
}

export default function useBlackjack() {
    const dealerDialogue = useDialogue();
    //hands
    const [dealerHand, setDealerHand] = useState<CardData[]>([]);
    const [playerHand, setPlayerHand] = useState<CardData[]>([]);
    //playerstates
    const [dealerState, setDealerState] = useState<PlayerState>(PlayerState.NONE);
    const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.NONE);

    // gameStates
    const [dealerPlaying, setDealerPlaying] = useState<boolean>(false);
    const dealerAnimator = useDealerAnimator(dealerPlaying);

    const [dealerAmount, setDealerAmount] = useState<number>(0);
    const [playerAmount, setPlayerAmount] = useState<number>(0);

    useEffect(() => {
        if (!dealerPlaying) return;

        startDealerLogic(dealerAmount, playerAmount);
    }, [dealerPlaying])

    function generateCard(hiddenState: boolean) {
        return { hidden: hiddenState, typeId: Math.floor(Math.random() * 10) + 1 } as CardData
    }

    function givePlayerHand() {
        for (let i = 0; i < 2; i++) {
            let generatedCard = generateCard(false);

            console.log(generatedCard);
            setPlayerHand((d: CardData[]) => [...d, generatedCard]);
        }
    }

    function giveDealerHand() {
        let generatedCard = generateCard(false);
        let hiddenGeneratedCard = generateCard(true);

        setDealerHand((d: CardData[]) => [...d, hiddenGeneratedCard]);
        setDealerHand((d: CardData[]) => [...d, generatedCard]);
    }

    function giveCard(handSetter: React.Dispatch<React.SetStateAction<CardData[]>>) {
        let generatedCard = generateCard(false);

        handSetter((d: CardData[]) => [...d, generatedCard]);
        return generatedCard.typeId;
    }

    // hit logic
    async function hitLogic() {
        if (playerState != PlayerState.NONE) return;

        await dealerDialogue.writeMessage("Hit ? Odd choice");
        dealerAnimator.setDealerOccupied(true);
        await dealerAnimator.playGiveCardAnimation();
        giveCard(setPlayerHand)
        await dealerAnimator.playReturnAnimation();
        dealerAnimator.setDealerOccupied(false);
        console.log("hit");
    }

    // stand logic
    const [standPosXStart, setStandPosXStart] = useState<number>(-1);

    function standLogicStart(e: React.MouseEvent) {
        if (playerState != PlayerState.NONE) return;

        let mousePos = e.clientX
        console.log("stand start", mousePos);

        setStandPosXStart(mousePos);
    }

    function standLogicEnd(e: React.MouseEvent) {
        if (standPosXStart < 0) return;

        let mousePos = e.clientX
        console.log("stand end", mousePos);

        if (Math.abs(standPosXStart - mousePos) >= 300) // 300 is minimum for it to be a stand (magic number though)
            setPlayerState(PlayerState.STANDING);
        setStandPosXStart(-1); // Reset
    }

    async function startDealerLogic(dealerAmount: number, playerAmount: number) {
        console.log("moving", dealerAmount);
        console.log("moving", playerAmount);
        dealerAnimator.setDealerOccupied(true);
        setDealerHand(prev => {
            const newHand = [...prev];
            if (newHand[0]) newHand[0].hidden = false;
            return newHand;
        });

        await dealerAnimator.playGiveCardAnimation(true);
        while (dealerAmount < playerAmount) {
            dealerAmount += giveCard(setDealerHand)
            await sleep(500);
            console.log("test");
        }
        await dealerAnimator.playReturnAnimation(true);
        dealerAnimator.playDefaultAnimation();
        dealerAnimator.setDealerOccupied(false);
        if (dealerState != PlayerState.BUSTED)
            setDealerState(PlayerState.STANDING);
    }

    async function blackjackTickGame() {
        let dealerAmount = dealerHand.reduce((accumulator, d) => {
            return accumulator + d.typeId;
        }, 0);
        setDealerAmount(dealerAmount);
        let playerAmount = playerHand.reduce((accumulator, d) => {
            return accumulator + d.typeId;
        }, 0);
        setPlayerAmount(playerAmount);

        // check for busts
        if (dealerAmount > 21) {
            console.log("dealerBust");
            setDealerState(PlayerState.BUSTED);
            await dealerDialogue.writeMessage("DANG IT, I went over...")
        }
        if (playerAmount > 21) {
            console.log("playerBust");
            setPlayerState(PlayerState.BUSTED);
            await dealerDialogue.writeMessage("Ahahah! How unfortunate, that's a bust.")
        }

        // check for win
        if (dealerAmount == 21) {
            console.log("dealerWin");
            setDealerState(PlayerState.WINNER);
            await dealerDialogue.writeMessage("Looks like you're out of luck, blackjack.")
        }
        if (playerAmount == 21) {
            console.log("playerwin");
            setPlayerState(PlayerState.WINNER);
            await dealerDialogue.writeMessage("BLACKJACK! Nice one.")
        }

        // game continuation
        if (playerState == PlayerState.STANDING && !dealerPlaying) {
            await dealerDialogue.writeMessage("Alright, let's see if you made the right choice");
            setDealerPlaying(true);
        }

        if (playerState == PlayerState.STANDING && dealerState == PlayerState.BUSTED) {
            console.log("playerwin dealer busted");
            setDealerState(PlayerState.BUSTED);
            await dealerDialogue.writeMessage("Well, looks like you beat me.")
        } else if (dealerState == PlayerState.STANDING) {
            console.log("playerlose dealer won")
            setPlayerState(PlayerState.WINNER);
            await dealerDialogue.writeMessage("Looks like you're out of luck, better luck next time ahah")
        }
    }

    return {
        dealerHand,
        playerHand,
        playerState,
        dealerState,
        givePlayerHand,
        giveDealerHand,
        hitLogic,
        giveCard,
        standLogicStart,
        standLogicEnd,
        blackjackTickGame,
        dealerAnimator,
        dealerPlaying,
        dealerDialogue
    };
}