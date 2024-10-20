import styled from "@emotion/styled";

import {Box} from "../../Elements/layout/Box";
import {resetCSS, themeAwareCss} from "../../Elements/utils";

import {LinkProps} from "./types";

export const Link = styled(Box.withComponent("a"))<LinkProps>(
    resetCSS,
    themeAwareCss({
        cursor: "pointer",
        color: "blue.default",
        borderBottom: "1px solid",
        borderColor: "transparent",
        "&:hover, &:active, &:focus": {
            color: "blue.default",
            textDecoration: "none",
            borderBottom: "1px solid",
            borderColor: "blue.default",
        },
    })
);
