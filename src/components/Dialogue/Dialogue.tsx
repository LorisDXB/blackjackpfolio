import "./Dialogue.css"
import React from 'react'

type DialogueProp = {
    dialogue: string;    
}

const Dialogue: React.FC<DialogueProp> = ({ dialogue }) => {
  return (
    <div className="dialogue-main">{dialogue}</div>
  )
}

export default Dialogue