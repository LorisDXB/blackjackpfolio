import "./Card.css";
import { forwardRef, useMemo } from "react";

// Import all card images from assets
const cardImages = import.meta.glob('../../assets/cards/*.jpg', { eager: true, as: 'url' });

// Create a dictionary linking card values (1-10) to their image paths
const cardMap: Record<number, string[]> = {};
let faceDownImage = '';

// Helper to parse value from filename
const getValueFromFilename = (filename: string): number => {
    const name = filename.split('/').pop()?.toLowerCase();
    if (!name) return 0;

    if (name.includes('face-down')) {
        faceDownImage = cardImages[filename];
        return 0;
    }

    if (name.includes('ace')) return 1;
    if (name.includes('jack') || name.includes('queen') || name.includes('king') || name.includes('10')) return 10;

    // Extract number for 2-9
    const match = name.match(/^(\d+)-/);
    if (match) return parseInt(match[1], 10);

    return 0;
};

// Populate the map
Object.keys(cardImages).forEach((path) => {
    const value = getValueFromFilename(path);
    const imageUrl = cardImages[path]; // This is the URL string because of as: 'url'

    if (value > 0) {
        if (!cardMap[value]) {
            cardMap[value] = [];
        }
        cardMap[value].push(imageUrl);
    }
});

type CardProp = {
    hidden: boolean;
    typeId: number;
};

const Card = forwardRef<HTMLDivElement, CardProp>(({ hidden, typeId }, ref) => {
    // Select a random card image for the given typeId
    // We use useMemo to ensure the image doesn't change on re-renders, 
    // but we use typeId as a dependency so different cards get different images (if logical identity changes)
    // However, since typeId is just a number, if we have multiple 10s, we want them random.
    // React's useMemo persists for the component instance. 
    // If the parent renders list with stable keys, this component instance is stable.

    const cardImage = useMemo(() => {
        const potentialImages = cardMap[typeId];
        if (!potentialImages || potentialImages.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * potentialImages.length);
        return potentialImages[randomIndex];
    }, [typeId]);

    return (
        <div ref={ref} className="card-main">
            {hidden ? (
                <img src={faceDownImage} alt="Hidden Card" className="card-img" />
            ) : (
                cardImage ? (
                    <img src={cardImage} alt={`Card ${typeId}`} className="card-img" />
                ) : (
                    <span>{typeId}</span> // Fallback
                )
            )}
        </div>
    );
});

export default Card;