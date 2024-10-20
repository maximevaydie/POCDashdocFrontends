import {Icon, IconNames, Text} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {Box} from "../Box";
import {Flex} from "../Flex";

export interface HeaderProps {
    title: string;
    icon?: IconNames;
    children?: React.ReactNode;
}
export const Header: FunctionComponent<HeaderProps> = ({icon = "truck", title, children}) => (
    <Flex alignItems="center">
        <Icon color="blue.default" name={icon} mr={2} fontSize={6} />
        <Box ml={2}>
            <Text variant="h2">{title}</Text>
            {children && (
                <Flex alignItems="center" mt={2}>
                    {children}
                </Flex>
            )}
        </Box>
    </Flex>
);
