import React, { forwardRef } from 'react'
import './Overlay.css'

const Overlay = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className='overlay-main'>Overlay</div>
  )
});

export default Overlay