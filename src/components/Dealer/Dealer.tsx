import { forwardRef } from 'react'
import "./Dealer.css"

const Dealer = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="dealer-main"></div>
  )
});

export default Dealer