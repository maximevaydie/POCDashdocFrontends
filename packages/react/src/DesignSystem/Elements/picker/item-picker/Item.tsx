import {Box, Flex, BoxProps, SelectOption} from "@dashdoc/web-ui";
import React from "react";

export const Item = ({
    option,
    ...props
}: BoxProps & {
    option?: SelectOption<string>;
}) => (
    <Box {...props} position="relative" paddingTop={1} paddingBottom={1}>
        <Flex alignItems={"center"} justifyContent={"space-between"}>
            {/*
// @ts-ignore */}
            <Flex>{option.label}</Flex>
        </Flex>
        <Box
            borderColor="blue.light"
            position="absolute"
            bottom="-7.5px"
            left="-12px"
            right="-12px"
        ></Box>
    </Box>
);
