import {ClickableBox} from "@dashdoc/web-ui";
import React from "react";

interface DayCircleProps {
    label: string;
    open: boolean;
    onClick: () => void;
}

export function DayCircle({label, open, onClick}: DayCircleProps) {
    return (
        <ClickableBox
            borderRadius="100%"
            width={"32px"}
            height={"32px"}
            textAlign={"center"}
            lineHeight={"32px"}
            mr={1}
            backgroundColor={open ? "blue.default" : "grey.light"}
            color={open ? "grey.white" : "grey.ultradark"}
            onClick={onClick}
            hoverStyle={{backgroundColor: open ? "blue.dark" : "grey.default"}}
        >
            {label}
        </ClickableBox>
    );
}
