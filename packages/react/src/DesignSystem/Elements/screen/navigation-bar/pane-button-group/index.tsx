import {Box, Text} from "@dashdoc/web-ui";
import React from "react";

import {PaneButtonGroupItem} from "./PaneButtonGroupItem";

export type PaneButtonGroupProps = {
    title?: string;
    children: React.ReactNode;
};

export function PaneButtonGroup(props: PaneButtonGroupProps) {
    return (
        <>
            {props.title !== undefined && (
                <Text variant="h1" mb={2} paddingBottom={1}>
                    {props.title}
                </Text>
            )}
            <Box width={"100%"} paddingBottom={4}>
                {props.children}
            </Box>
        </>
    );
}

export {PaneButtonGroupItem};
