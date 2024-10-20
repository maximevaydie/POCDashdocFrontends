import {Flex, Text} from "@dashdoc/web-ui";
import React from "react";

export function WarningIcon() {
    return (
        <Flex
            width="20px"
            height="20px"
            borderRadius="50%"
            alignItems="center"
            justifyContent="center"
            backgroundColor="grey.white"
            border="2px solid"
            borderColor="red.default"
            ml={"-12%"}
            zIndex="level1"
        >
            {/* eslint-disable-next-line react/jsx-no-literals */}
            <Text fontSize={3} fontWeight="bold" color="red.default">
                !
            </Text>
        </Flex>
    );
}
