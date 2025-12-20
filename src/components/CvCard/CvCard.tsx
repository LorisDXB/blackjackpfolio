import './CvCard.css'
import cv from '../../assets/cv-1.pdf'
import React, { useRef, useState } from 'react'

const CvCard = () => {
  const [scaledUp, setScaledUp] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<Animation | null>(null)

  function scaleUpCv() {
    if (!cardRef.current || scaledUp) return

    animationRef.current?.cancel()

    animationRef.current = cardRef.current.animate(
      [
        { transform: 'scale(0.25)' },
        { transform: 'scale(1)' }
      ],
      {
        duration: 300,
        easing: 'ease-out',
        fill: 'forwards'
      }
    )

    setScaledUp(true)
  }

  function scaleDownCv() {
    if (!cardRef.current) return

    animationRef.current?.cancel()

    animationRef.current = cardRef.current.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(0.25)' }
      ],
      {
        duration: 250,
        easing: 'ease-in',
        fill: 'forwards'
      }
    )

    setScaledUp(false)
  }

  return (
    <>
      <div className="relative w-[120px] h-[200px] flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          {scaledUp && (
            <div
              className="fixed inset-0 z-40"
              onClick={scaleDownCv}
            />
          )}

          <div
            ref={cardRef}
            className="cvCard-main relative z-50 origin-center w-[480px] h-[800px]"
            style={{ transform: 'scale(0.25)' }}
          >
            <div
              className={`absolute inset-0 z-10 cursor-pointer ${scaledUp ? 'hidden' : 'block'}`}
              onClick={scaleUpCv}
            />
            <iframe
              src={cv}
              className={`w-full h-full ${scaledUp ? 'pointer-events-auto' : 'pointer-events-none'}`}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default CvCard