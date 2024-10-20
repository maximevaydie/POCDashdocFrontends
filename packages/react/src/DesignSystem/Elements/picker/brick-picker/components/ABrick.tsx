import React from "react";
import {HeightProps} from "styled-system";

import {BrickStyle} from "../types";

import {ClickableArea} from "./ClickableArea";

export function ABrick({
    defaultStyle,
    hoverStyle,
    height = "24px",
    forceHover = false,
}: BrickStyle & HeightProps) {
    return (
        <ClickableArea
            {...defaultStyle}
            forceHover={forceHover}
            hoverStyle={hoverStyle}
            height={height}
        />
    );
}
