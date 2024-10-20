import {Box, Text} from "@dashdoc/web-ui";
import React from "react";

type Props = {
    text: string;
};

export function LegendTitle({text}: Props) {
    return (
        <Box p={2}>
            <Text variant="h1">{text}</Text>
        </Box>
    );
}
