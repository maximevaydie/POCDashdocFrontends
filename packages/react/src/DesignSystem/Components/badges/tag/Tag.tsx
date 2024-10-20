import {Tag as TagData, TagColor} from "dashdoc-utils";
import React from "react";

import {Badge, BadgeProps} from "../badge";

export interface TagProps extends BadgeProps {
    tag: TagData;
    hideText?: boolean;
}

export function Tag({tag, hideText = false, ...rest}: TagProps) {
    return (
        <Badge
            noWrap
            alignItems="center"
            justifyContent="center"
            alignSelf="center"
            variant="none"
            backgroundColor={tag.color}
            color={TAG_COLOR_VARIANTS[tag.color]?.textColor ?? "white"}
            shape="squared"
            minHeight={8}
            minWidth={40}
            {...rest}
        >
            {!hideText ? tag["name"] : null}
        </Badge>
    );
}

export const TAG_COLOR_VARIANTS: Record<
    TagColor,
    {
        color: TagColor;
        textColor: string;
    }
> = {
    "#4B71FA": {
        color: "#4B71FA",
        textColor: "white",
    },
    "#25B9E6": {
        color: "#25B9E6",
        textColor: "white",
    },
    "#36B29D": {
        color: "#36B29D",
        textColor: "white",
    },
    "#8FD458": {
        color: "#8FD458",
        textColor: "#313335",
    },
    "#FAC938": {
        color: "#FAC938",
        textColor: "black",
    },
    "#FA9538": {
        color: "#FA9538",
        textColor: "white",
    },
    "#E54D45": {
        color: "#E54D45",
        textColor: "white",
    },
    "#F0619D": {
        color: "#F0619D",
        textColor: "white",
    },
    "#A165F4": {
        color: "#A165F4",
        textColor: "white",
    },
    "#D3DAE0": {
        color: "#D3DAE0",
        textColor: "black",
    },
} as const;
