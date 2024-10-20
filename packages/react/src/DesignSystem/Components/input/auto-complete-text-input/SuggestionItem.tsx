import styled from "@emotion/styled";

import {theme} from "../../../Elements/theme";

export const SuggestionItem = styled("li")`
    cursor: pointer;
    padding: 10px 15px;
    list-style: none;

    &.active {
        background: ${theme.colors.grey.light};
    }
`;
