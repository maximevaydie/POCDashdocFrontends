import {Flex, LoadingWheel, Text} from "@dashdoc/web-ui";
import React from "react";

export function ResourceHeader({isLoading}: {isLoading: boolean}) {
    return (
        <Flex>
            <Text fontSize="7px" lineHeight="10px">
                {isLoading && <LoadingWheel noMargin inline />}
            </Text>
        </Flex>
    );
}
