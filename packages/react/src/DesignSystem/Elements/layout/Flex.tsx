import styled from "@emotion/styled";

import {Box, BoxProps} from "./Box";

export type FlexProps = BoxProps;

export const Flex = styled(Box)<FlexProps>({
    display: "flex",
});
