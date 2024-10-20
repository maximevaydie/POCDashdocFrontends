import {theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";

export const ClickableAddRegion = styled("div")`
    position: relative;
    padding: 5px 5px;
    margin-left: -5px;
    margin-right: -5px;

    &:hover {
        background-color: ${theme.colors.grey.light};
    }
    cursor: pointer;
`;
