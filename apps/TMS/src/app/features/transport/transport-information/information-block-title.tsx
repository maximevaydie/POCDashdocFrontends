import {Box, Flex, Icon, BoxProps, Text, IconProps} from "@dashdoc/web-ui";
import React from "react";

type Props = BoxProps & {
    iconName: IconProps["name"];
    label: string;
    afterLabel?: React.ReactNode;
};

export function InformationBlockTitle({
    iconName,
    label,
    afterLabel,
    children,
    ...containerProps
}: Props) {
    return (
        <Box flex={1} {...containerProps}>
            <Flex alignItems="baseline" fontSize={1}>
                <Icon name={iconName} color="blue.default" mr={2} />
                <Text variant="captionBold">{label}</Text>
                {afterLabel}
            </Flex>
            {children}
        </Box>
    );
}
