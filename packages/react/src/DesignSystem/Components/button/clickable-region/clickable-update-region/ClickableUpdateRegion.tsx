import React from "react";

import {ClickableUpdateRegionStyle} from "./ClickableUpdateRegionStyle";
import {NonClickableUpdateRegionStyle} from "./NonClickableUpdateRegionStyle";
import {ClickableUpdateRegionProps} from "./types";

export const ClickableUpdateRegion = function (props: ClickableUpdateRegionProps) {
    const Component = props.clickable ? ClickableUpdateRegionStyle : NonClickableUpdateRegionStyle;
    const clickableProps = props.clickable ? {updateButtonLabel: props.updateButtonLabel} : {};
    return (
        <Component
            {...clickableProps}
            onClick={props.clickable ? props.onClick : undefined}
            data-testid={props["data-testid"]}
        >
            {props.children}
        </Component>
    );
};
