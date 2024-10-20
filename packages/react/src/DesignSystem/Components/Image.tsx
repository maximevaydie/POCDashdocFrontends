import styled from "@emotion/styled";

import {Box, BoxProps} from "../Elements/layout/Box";

export type ImageProps = BoxProps;

export const Image = styled(Box.withComponent("img"))<ImageProps>({});
