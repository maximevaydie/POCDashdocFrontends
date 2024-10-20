import {Icon} from "@dashdoc/web-ui";
import React from "react";

import {ClickableArea} from "./ClickableArea";

type Props = {
    forceHover?: boolean;
};
export function SelectColumn({forceHover = false}: Props) {
    return (
        <ClickableArea
            color="grey.light"
            hoverStyle={{
                bg: "transparent",
                color: "blue.dark",
            }}
            forceHover={forceHover}
            p="4px"
            height="24px"
            justifyContent="center"
        >
            <Icon name="arrowDownFull" />
        </ClickableArea>
    );
}
