import {Box, Flex, theme, themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";

const backgroundColors: {[severity: string]: string} = {
    positive: "green",
    warn: "yellow",
};

const getBorderColor = (severity: keyof typeof backgroundColors, active: boolean) => {
    if (!active) {
        return "grey.light";
    }
    return `${backgroundColors[severity]}.dark`;
};

const ButtonFilterBox = styled(Box)<{
    severity: keyof typeof backgroundColors;
    active: boolean;
}>(({severity, active}) =>
    themeAwareCss({
        padding: `${theme.space[2]}px ${theme.space[2]}px`,
        margin: `0 ${theme.space[1]}px`,
        cursor: "pointer",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: `${backgroundColors[severity]}.ultralight`,
        color: `${backgroundColors[severity]}.dark`,
        border: "1px solid",
        borderRadius: 1,
        borderColor: getBorderColor(severity, active),
    })
);

type Props = {
    severity: keyof typeof backgroundColors;
    onClick: () => void;
    label: string;
    active?: boolean;
    "data-testid"?: string;
};

export function ButtonFilter({severity, label, active = false, ...boxProps}: Props) {
    return (
        <ButtonFilterBox severity={severity} active={active} {...boxProps}>
            <Flex>{label}</Flex>
        </ButtonFilterBox>
    );
}
