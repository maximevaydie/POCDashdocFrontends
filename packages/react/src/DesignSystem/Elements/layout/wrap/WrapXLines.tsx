import styled from "@emotion/styled";

import {Box} from "../Box";

export type WrapXLinesProps = {numberOfLines: number};

export const WrapXLines = styled(Box)<WrapXLinesProps>`
    text-overflow: ellipsis;
    overflow: hidden;
    max-height: ${(props) => {
        if (props.maxHeight) {
            return props.maxHeight;
        }
        return "calc(1.42857em * " + props.numberOfLines + ")";
    }};
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: ${(props) => props.numberOfLines};
`;
