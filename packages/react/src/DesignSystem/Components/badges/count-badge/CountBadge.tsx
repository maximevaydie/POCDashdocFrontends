import {Box, BoxProps, Flex} from "@dashdoc/web-ui";
import React from "react";

import {Badge} from "../badge";

interface Props extends BoxProps {
    value: number;
    "data-testid"?: string;
}

export function CountBadge({value, "data-testid": testId, ...boxProps}: Props) {
    return (
        <Box mr={2} {...boxProps}>
            <Badge mr={2} fontSize={1} height={20} width={20} lineHeight="20px">
                <Flex alignItems="center" justifyContent="center" data-testid={testId}>
                    {value}
                </Flex>
            </Badge>
        </Box>
    );
}
