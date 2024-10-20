import React from "react";

import {Box} from "../../Elements/layout/Box";

import {LoadingWheel} from "./LoadingWheel";

export const LoadingOverlay = () => (
    <Box
        position="absolute"
        top={0}
        bottom={0}
        left={0}
        right={0}
        backgroundColor="neutral.lighterTransparentBlack"
        zIndex="loadingOverlay"
    >
        <Box position="absolute" left="50%" top="50%">
            <LoadingWheel noMargin={true} />
        </Box>
    </Box>
);
