import { useEffect, useRef } from 'react'
import './App.css'
import Card from './components/Card/Card'
import Dealer from './components/Dealer/Dealer'
import Dialogue from './components/Dialogue/Dialogue'
import useBlackjack, { type CardData } from './hooks/useBlackjack'
import Overlay from './components/Overlay/Overlay'
import CvCard from './components/CvCard/CvCard'
import texture from './assets/texture.jpg'

function App() {
  let bj = useBlackjack();

  useEffect(() => {
    bj.blackjackTickGame();
  }, [bj.dealerHand, bj.playerHand, bj.playerState]);

  return (
    <div className='board-main'>
      {/* <img src={texture} className='texture-main'/> */}
      <Overlay ref={bj.overlayAnimator.overlayRef}/>
      <Dealer ref={bj.dealerAnimator.dealerRef} />
      {!bj.dealerDialogue.hidden && <Dialogue dialogue={bj.dealerDialogue.typedOut}/>}
      {/* Dealer side */}
      <div className='board-side flex-wrap-reverse'>
        {bj.dealerHand.map((d: CardData, index) => (
          <Card ref={bj.dealerAnimator.dealerSpotRef} key={`${d.typeId}-${index}`} hidden={d.hidden} typeId={d.typeId} />
        ))}
      </div>

      <div className='board-side'>
        {bj.wonOnce ? (<CvCard />) : (<div ref={bj.dealerAnimator.cvSpotRef}
          className='w-20 h-20 border border-red-500 rotate-45'></div>)}
      </div>

      {/* Player side */}
      <div className='board-side flex-wrap z-1'
        onDoubleClick={bj.hitLogic}
        onMouseDown={bj.standLogicStart}
        onMouseUp={bj.standLogicEnd}>
        {bj.playerHand.map((d: CardData, index) => {
          const lastCard = index == bj.playerHand.length - 1;

          return (<Card ref={lastCard ? bj.dealerAnimator.playerSpotRef : null} key={`${d.typeId}-${index}`} hidden={d.hidden} typeId={d.typeId} />);
        })}
      </div>
    </div>
  )
}

export default App
