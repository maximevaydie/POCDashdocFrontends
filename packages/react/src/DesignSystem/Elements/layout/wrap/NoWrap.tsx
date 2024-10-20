import styled from "@emotion/styled";

import {Box} from "../Box";

export const NoWrap = styled(Box)`
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
`;
