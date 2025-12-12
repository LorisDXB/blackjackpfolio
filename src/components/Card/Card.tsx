import "./Card.css";
import { forwardRef } from "react";

type CardProp = {
    hidden: boolean;
    typeId: number;
};

const Card = forwardRef<HTMLDivElement, CardProp>(({ hidden, typeId}, ref) => {
    return (
        <div ref={ref} className="card-main">
            {!hidden && (
                <span>{typeId}</span>
            )}
        </div>
    );
});

export default Card;