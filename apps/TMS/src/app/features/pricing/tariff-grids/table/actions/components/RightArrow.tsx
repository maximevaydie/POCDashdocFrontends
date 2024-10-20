import React from "react";

export const RightArrow = ({color = "#919EAB"}) => (
    <div style={{display: "flex", alignItems: "center", flexGrow: 1, marginRight: 4}}>
        <div style={{height: "1px", backgroundColor: color, flexGrow: 1}}></div>
        <svg style={{flexShrink: 0}} width="10" height="10" viewBox="0 0 24 24">
            <path d="M20 12L0 24V0Z" fill={color} />
        </svg>
    </div>
);
