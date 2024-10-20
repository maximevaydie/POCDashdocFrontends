import styled from "@emotion/styled";
import {Property as TCSSProperty} from "csstype";
import {color, system, typography, variant} from "styled-system";

import {Box, BoxProps} from "../Elements/layout/Box";

const properties = system({
    textOverflow: true,
    whiteSpace: true,
    textDecoration: true,
    textTransform: true,
    overflowWrap: true,
});

type TextType = {
    fontSize: string | number;
    lineHeight: string;
    fontWeight?: string;
    color: string;
};

export const textVariants: {
    title: TextType;
    h1: TextType;
    h2: TextType;
    body: TextType;
    captionBold: TextType;
    caption: TextType;
    subcaption: TextType;
} = {
    title: {
        fontSize: "20px",
        lineHeight: "27px",
        fontWeight: "600",
        color: "grey.ultradark",
    },
    h1: {
        fontSize: 3,
        fontWeight: "600",
        lineHeight: "22px",
        color: "grey.ultradark",
    },
    h2: {
        fontSize: 2,
        fontWeight: "600",
        lineHeight: "19px",
        color: "grey.dark",
    },
    body: {
        fontSize: 2,
        lineHeight: "19px",
        color: "grey.ultradark",
    },
    captionBold: {
        fontSize: 1,
        lineHeight: "16px",
        fontWeight: "600",
        color: "grey.ultradark",
    },
    caption: {
        fontSize: 1,
        lineHeight: "16px",
        color: "grey.ultradark",
    },

    subcaption: {
        fontSize: "11px",
        lineHeight: "15px",
        color: "grey.ultradark",
    },
};

export type TextProps = BoxProps & {
    variant?: keyof typeof textVariants;
    textOverflow?: TCSSProperty.TextOverflow;
    whiteSpace?: TCSSProperty.WhiteSpace;
    textDecoration?: TCSSProperty.TextDecoration;
    textTransform?: TCSSProperty.TextTransform;
    overflowWrap?: TCSSProperty.OverflowWrap;
    ellipsis?: boolean;
};

export const Text = styled(Box.withComponent("p"))<TextProps>(
    variant({variants: textVariants}),
    properties,
    typography,
    ({ellipsis}) =>
        ellipsis && {
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
        },
    // needed to allow to override color of variant
    // until this PR is merge: https://github.com/styled-system/styled-system/pull/886
    color
);

Text.defaultProps = {
    variant: "body",
    fontFamily: "primary",
    whiteSpace: "pre-line",
};
