import {Box, Flex} from "@dashdoc/web-ui";
import React from "react";

type Props = {
    icon: any;
    text: any;
};

export function LegendLine({icon, text}: Props) {
    return (
        <Flex mb={3}>
            <Box flexBasis="20%" pl={2} alignSelf="center">
                {icon}
            </Box>
            <Box flexBasis="80%" alignSelf="center">
                {text}
            </Box>
        </Flex>
    );
}
