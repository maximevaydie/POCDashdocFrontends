import styled from "@emotion/styled";

import {Box, BoxProps} from "./Box";

export type CardProps = BoxProps;

export const Card = styled(Box)<CardProps>();

Card.defaultProps = {
    backgroundColor: "grey.white",
    boxShadow: "medium",
    borderRadius: 2,
    overflow: "hidden",
};
