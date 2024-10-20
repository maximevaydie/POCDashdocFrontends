import {Box, Flex} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import React from "react";

import {ProductLogo} from "../logo/ProductLogo";

export function LoadingScreen() {
    return (
        <Flex
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            margin="auto"
        >
            <Box maxWidth={500} height="406px" alignItems="center">
                <ProductLogo />
                <Box mt={8}>
                    <LoadingWheel noMargin />
                </Box>
            </Box>
        </Flex>
    );
}
