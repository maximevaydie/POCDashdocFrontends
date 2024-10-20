import {Flex, FlexProps, Text} from "@dashdoc/web-ui";
import React from "react";

type Props = {
    title: string;
    children: React.ReactNode;
} & FlexProps;

export function SettingsFormSection({title, children, ...props}: Props) {
    return (
        <Flex flexDirection="column" maxWidth={"620px"} {...props}>
            <Text variant="h1" color="grey.dark">
                {title}
            </Text>
            <Flex mt={2} flexDirection="column" flexGrow={1}>
                {children}
            </Flex>
        </Flex>
    );
}
