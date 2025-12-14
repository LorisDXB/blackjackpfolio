import { useEffect, useRef } from 'react'
import './App.css'
import Card from './components/Card/Card'
import Dealer from './components/Dealer/Dealer'
import Dialogue from './components/Dialogue/Dialogue'
import useBlackjack, { type CardData } from './hooks/useBlackjack'

function App() {
  let bj = useBlackjack();
  // const initialHandGiven = useRef(false);

  // useEffect(() => {
  //   if (!initialHandGiven.current) {
  //     bj.givePlayerHand();
  //     bj.giveDealerHand();
  //     initialHandGiven.current = true;
  //   }
  // }, []);

  useEffect(() => {
    bj.blackjackTickGame();
  }, [bj.dealerHand, bj.playerHand, bj.playerState, bj.dealerState, bj.dealerPlaying]);

  return (
    <div className='board-main'>
      {!bj.dealerDialogue.hidden && <Dialogue dialogue={bj.dealerDialogue.typedOut}/>}
      {/* Dealer side */}
      <div className='board-side'>
        <Dealer ref={bj.dealerAnimator.dealerRef} />
        {bj.dealerHand.map((d: CardData, index) => (
          <Card ref={bj.dealerAnimator.dealerSpotRef} key={`${d.typeId}-${index}`} hidden={d.hidden} typeId={d.typeId} />
        ))}
      </div>

      {/* Player side */}
      <div className='board-side'
        onDoubleClick={bj.hitLogic}
        onMouseDown={bj.standLogicStart}
        onMouseUp={bj.standLogicEnd}>
        {bj.playerHand.map((d: CardData, index) => {
          const lastCard = index == bj.playerHand.length - 1;

          console.log("reloaded")
          return (<Card ref={lastCard ? bj.dealerAnimator.playerSpotRef : null} key={`${d.typeId}-${index}`} hidden={d.hidden} typeId={d.typeId} />);
        })}
      </div>

    </div>
  )
}

export default App
