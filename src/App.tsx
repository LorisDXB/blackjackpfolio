import { useEffect, useRef } from 'react'
import './App.css'
import Card from './components/Card/Card'
import Dealer from './components/Dealer/Dealer'
import Dialogue from './components/Dialogue/Dialogue'
import useBlackjack, { type CardData } from './hooks/useBlackjack'

function App() {
  let bj = useBlackjack();
  const initialHandGiven = useRef(false);

  useEffect(() => {
    if (!initialHandGiven.current) {
      bj.givePlayerHand();
      bj.giveDealerHand();
      initialHandGiven.current = true;
    }
  }, []);

  useEffect(() => {
      bj.blackjackTickGame();
  }, [bj.dealerHand, bj.playerHand, bj.playerState, bj.dealerState]);

  return (
    <div className='board-main'>
      {/* Dealer side */}
      <div className='board-side'> 
        <Dealer ref={bj.dealerAnimator.dealerRef} />
        {bj.dealerHand.map((d: CardData, index) => (
          <Card key={`${d.typeId}-${index}`} hidden={d.hidden} typeId={d.typeId}/>
        ))}
      </div>

      {/* Player side */}
      <div ref={bj.dealerAnimator.cardSpotRef} className='board-side'
        onDoubleClick={bj.hitLogic}
        onMouseDown={bj.standLogicStart}
        onMouseUp={bj.standLogicEnd}>
        {bj.playerHand.map((d: CardData, index) => {
          const lastCard = index == bj.playerHand.length - 1;

          return (<Card ref={lastCard ? bj.dealerAnimator.cardSpotRef : null} key={`${d.typeId}-${index}`} hidden={d.hidden} typeId={d.typeId} />);
        })}
      </div>

      {/* <Dialogue dialogue={"Welcome"}/> */}
    </div>
  )
}

export default App
