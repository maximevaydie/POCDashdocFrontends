import styled from "@emotion/styled";

import {Box} from "../../../Elements/layout/Box";

import {JSIconContainerProps} from "./types";

export const JSIconContainer = styled(Box.withComponent("i"))<JSIconContainerProps>`
    display: inline-flex;
    align-self: center;
    align-items: center;
    justify-content: center;
    min-width: unset;
    ${({round}) =>
        round &&
        `
        width: 3em;
        height: 3em;
        line-height: 3em;
        font-size: 0.75em;
        text-align: center;
        border-radius: 999px;
    `}
`;
