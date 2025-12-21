import { useRef } from "react";

export function useOverlay()
{
    const overlayRef = useRef<HTMLDivElement>(null);
    // const [transitionRequest, setTransitionRequest] = useState<boolean>(false);

    async function fadeInOverlay()
    {
        return new Promise((res) => {
            const overlay = overlayRef.current;
            if(!overlay) {
                res(null);
                return;
            }

            overlay.animate([
                {opacity: 0},
                {opacity: 1}
            ], {duration:1000, easing: "ease"}).onfinish = () => res(null);
        })
    }

    async function fadeOutOverlay()
    {
        return new Promise((res) => {
            const overlay = overlayRef.current;
            if(!overlay) {
                res(null);
                return;
            }

            overlay.animate([
                {opacity: 1},
                {opacity: 0}
            ], {duration:500, easing: "ease"}).onfinish = () => res(null);
        })
    }

    return {
        overlayRef,
        fadeInOverlay,
        fadeOutOverlay
        // setTransitionRequest
    };
}