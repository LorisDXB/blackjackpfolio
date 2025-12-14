import { useEffect, useRef, useState } from "react";
import { sleep } from "../utility/utility";

enum MessageState {
    NONE,
    WRITING
}

export function useDialogue()
{
    const [hidden, setHidden] = useState<boolean>(true);
    const [typedOut, setTypedOut] = useState<string>("");
    const messageState = useRef<MessageState>(MessageState.NONE);

    function resetDialogue() {
        messageState.current = MessageState.NONE;
        setTypedOut("");
        setHidden(true);
    }

    async function writeMessage(message: string) {
        if (message.length == 0 || messageState.current == MessageState.WRITING) return;
        let messageIdx = 0; 
        
        setHidden(false);
        messageState.current = MessageState.WRITING;
        while (messageIdx != message.length &&
            messageState.current == MessageState.WRITING) {
                messageIdx += 1;
                setTypedOut(message.substring(0, messageIdx));
                await sleep(50);
        }
        await sleep(500);
        resetDialogue();
    }

    return {
        writeMessage,
        typedOut,
        hidden,
        resetDialogue
    };
}