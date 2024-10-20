import styled from "@emotion/styled";

import {theme} from "../Elements/theme";

import {Text} from "./Text";

export const ClickableText = styled(Text)`
    display: inline;
    font-weight: bold;
    @media (max-width: 450px) {
        font-size: 15px;
        background: ${theme.colors.grey.light};
        padding: 5px 8px;
        border-radius: 3px;
        box-shadow: 0 2px 0 ${theme.colors.grey.default};
    }
`;
