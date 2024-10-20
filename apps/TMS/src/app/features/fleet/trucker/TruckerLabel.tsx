import {Flex, Icon, Text} from "@dashdoc/web-ui";
import React from "react";

export default function TruckerLabel({text}: {text: string}) {
    return (
        <Flex>
            <Icon name="user" mr={1} />
            <Text variant="subcaption" mr={1}>
                {text}
            </Text>
        </Flex>
    );
}
