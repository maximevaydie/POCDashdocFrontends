import {Icon} from "@dashdoc/web-ui";
import React from "react";

import {ClickableArea} from "./ClickableArea";

type AddLineProps = {
    forceHover?: boolean;
};
export function ClearAll({forceHover = false}: AddLineProps) {
    return (
        <ClickableArea
            color="grey.dark"
            hoverStyle={{
                borderRadius: "8px",
                color: "grey.dark",
            }}
            forceHover={forceHover}
            p="4px"
            height="24px"
            justifyContent="center"
        >
            <Icon name="cancel" />
        </ClickableArea>
    );
}
