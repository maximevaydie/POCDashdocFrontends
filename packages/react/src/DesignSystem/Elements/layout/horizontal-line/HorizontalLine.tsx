import React from "react";

import {Box, BoxProps} from "../Box";

export type HorizontalLineProps = BoxProps & {
    size?: number;
};

export function HorizontalLine({size = 1, ...props}: HorizontalLineProps) {
    return (
        <Box
            as={"hr"}
            width={"100%"}
            borderTop={`${size}px solid`}
            borderColor="grey.light"
            marginY={2}
            alignSelf="center"
            {...props}
        />
    );
}
