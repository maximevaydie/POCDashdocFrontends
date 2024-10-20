import {Icon, Text, Flex, IconNames} from "@dashdoc/web-ui";
import React, {ReactNode} from "react";

export function DataInfo({icon, label}: {icon: IconNames; label: string | ReactNode}) {
    return (
        <Flex alignItems="center">
            <Icon name={icon} mr={2} />
            {typeof label === "string" ? (
                <Text variant="caption" ellipsis>
                    {label === "" ? "--" : label}
                </Text>
            ) : (
                label
            )}
        </Flex>
    );
}
