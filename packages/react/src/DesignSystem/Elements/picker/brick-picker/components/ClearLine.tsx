import {Icon} from "@dashdoc/web-ui";
import React from "react";

import {ClickableArea} from "./ClickableArea";

type ClearBreakLineProps = {
    forceHover?: boolean;
};
export function ClearLine({forceHover = false}: ClearBreakLineProps) {
    return (
        <ClickableArea
            color="grey.light"
            hoverStyle={{
                borderRadius: "8px",
                color: "grey.dark",
            }}
            forceHover={forceHover}
            p="4px"
            height="24px"
        >
            <Icon name="cancel" />
        </ClickableArea>
    );
}
