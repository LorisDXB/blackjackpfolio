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
    const dealerOccupied = useRef<boolean>(false);
    const dealerAnimator = useDealerAnimator(dealerPlaying);

    const [dealerAmount, setDealerAmount] = useState<number>(0);
    const [playerAmount, setPlayerAmount] = useState<number>(0);

  const initialHandGiven = useRef(false);

  useEffect(() => {
    if (!initialHandGiven.current) {
      givePlayerHand();
      giveDealerHand();
      initialHandGiven.current = true;
    }
  }, []);

    useEffect(() => {
        if (!dealerPlaying) return;

        startDealerLogic(dealerAmount, playerAmount);
    }, [dealerPlaying])

    function resetGame() {
        setDealerHand([]);
        setPlayerHand([]);
        setDealerState(PlayerState.NONE);
        setPlayerState(PlayerState.NONE);
        setDealerPlaying(false);
        setDealerAmount(0);
        setPlayerAmount(0);
        giveDealerHand();
        givePlayerHand();
        dealerAnimator.resetAnimator();
        dealerDialogue.resetDialogue();
    }

    function generateCard(hiddenState: boolean) {
        return { hidden: hiddenState, typeId: Math.floor(Math.random() * 10) + 1 } as CardData
    }

    function givePlayerHand() {
        for (let i = 0; i < 2; i++) {
            let generatedCard = generateCard(false);

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
        if (playerState != PlayerState.NONE || dealerOccupied.current) return;

        dealerOccupied.current = true;
        await dealerDialogue.writeMessage("Hit ? Odd choice");
        await dealerAnimator.playGiveCardAnimation();
        giveCard(setPlayerHand)
        dealerOccupied.current = false; // I put this here instead of after the return anim
        // because it causes a bug where it sets dealerOccupied.false when the ticklogic needs it on
        await dealerAnimator.playReturnAnimation();
        console.log("hit", dealerOccupied.current);
    }

    // stand logic
    const [standPosXStart, setStandPosXStart] = useState<number>(-1);

    function standLogicStart(e: React.MouseEvent) {
        if (playerState != PlayerState.NONE) return;

        let mousePos = e.clientX

        setStandPosXStart(mousePos);
    }

    function standLogicEnd(e: React.MouseEvent) {
        if (standPosXStart < 0) return;

        let mousePos = e.clientX

        if (Math.abs(standPosXStart - mousePos) >= 300 && !dealerOccupied.current) // 300 is minimum for it to be a stand (magic number though)
            setPlayerState(PlayerState.STANDING);
        setStandPosXStart(-1); // Reset
    }

    async function startDealerLogic(dealerAmount: number, playerAmount: number) {
        setDealerHand(prev => {
            const newHand = [...prev];
            if (newHand[0]) newHand[0].hidden = false;
            return newHand;
        });

        await dealerAnimator.playGiveCardAnimation(true);
        while (dealerAmount < playerAmount) {
            dealerAmount += giveCard(setDealerHand)
            await sleep(500);
        }
        await dealerAnimator.playReturnAnimation(true);
        dealerAnimator.playDefaultAnimation();
        dealerOccupied.current = false;
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
            dealerOccupied.current = true;
            await dealerDialogue.writeMessage("DANG IT, I went over...")
            setDealerState(PlayerState.BUSTED);
            resetGame();
            dealerOccupied.current = false;
        }
        if (playerAmount > 21) {
            dealerOccupied.current = true;
            console.log("TESTEST", dealerOccupied.current)
            await dealerDialogue.writeMessage("Ahahah! How unfortunate, that's a bust.")
            setPlayerState(PlayerState.BUSTED);
            resetGame();
            dealerOccupied.current = false;
            console.log("instant", dealerOccupied.current)
        }

        // check for win
        if (dealerAmount == 21) {
            dealerOccupied.current = true;
            await dealerDialogue.writeMessage("Looks like you're out of luck, blackjack.")
            setDealerState(PlayerState.WINNER);
            resetGame();
            dealerOccupied.current = false;
        }
        if (playerAmount == 21) {
            dealerOccupied.current = true;
            await dealerDialogue.writeMessage("BLACKJACK! Nice one.")
            setPlayerState(PlayerState.WINNER);
            resetGame();
            dealerOccupied.current = false;
        }

        // game continuation
        if (playerState == PlayerState.STANDING && !dealerPlaying && !dealerOccupied.current) {
            dealerOccupied.current = true;
            await dealerDialogue.writeMessage("Alright, let's see if you made the right choice");
            setDealerPlaying(true);
            dealerOccupied.current = false;
        }

        if (playerState == PlayerState.STANDING && dealerState == PlayerState.BUSTED) {
            dealerOccupied.current = true;
            await dealerDialogue.writeMessage("Well, looks like you beat me.")
            setDealerState(PlayerState.BUSTED);
            resetGame();
            dealerOccupied.current = false;
        } else if (dealerState == PlayerState.STANDING) {
            dealerOccupied.current = true;
            await dealerDialogue.writeMessage("Looks like you're out of luck, better luck next time ahah")
            setPlayerState(PlayerState.WINNER);
            resetGame();
            dealerOccupied.current = false;
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