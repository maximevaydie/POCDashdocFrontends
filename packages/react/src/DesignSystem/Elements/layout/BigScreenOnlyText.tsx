import {BoxProps} from "@dashdoc/web-ui";
import styled from "@emotion/styled";

import {Text} from "../../Components/Text";

type BigScreenOnlyBoxProps = BoxProps & {
    hiddenUnder: number;
};

export const BigScreenOnlyText = styled(Text)<BigScreenOnlyBoxProps>`
    @media screen and (max-width: ${(props) => props.hiddenUnder}px) {
        display: none;
    }
`;
