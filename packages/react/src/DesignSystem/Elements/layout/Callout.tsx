import React, {FunctionComponent} from "react";

import {Icon, IconNames} from "../../Components/icon";
import {theme} from "../../theme";

import {Box, BoxProps} from "./Box";
import {Flex} from "./Flex";

export const calloutVariants = {
    informative: {
        backgroundColor: theme.colors.grey.ultralight,
        icon: "info",
    },
    neutral: {
        backgroundColor: "transparent",
        icon: "info",
    },
    warning: {
        backgroundColor: theme.colors.yellow.ultralight,
        icon: "alert",
        iconColor: theme.colors.yellow.dark,
    },
    danger: {
        backgroundColor: theme.colors.red.ultralight,
        icon: "warning",
        iconColor: theme.colors.red.default,
    },
    secondary: {
        backgroundColor: theme.colors.blue.ultralight,
        icon: "info",
        iconColor: theme.colors.blue.default,
    },
} as const;

export type CalloutProps = BoxProps & {
    variant?: keyof typeof calloutVariants;
    iconDisabled?: boolean;
    children: React.ReactNode;
    icon?: IconNames;
};

export const Callout: FunctionComponent<CalloutProps> = ({
    variant = "informative",
    iconDisabled = false,
    icon,
    children,
    ...boxProps
}) => {
    const variantProps = calloutVariants[variant];
    return (
        <Flex
            p={4}
            backgroundColor={variantProps.backgroundColor}
            borderRadius={1}
            alignItems="center"
            {...boxProps}
        >
            {!iconDisabled && (
                <Flex pr={4} margin="auto" flexShrink={0}>
                    <Icon
                        scale={1.2}
                        width={19}
                        height={19}
                        color={"iconColor" in variantProps ? variantProps.iconColor : undefined}
                        textAlign="center"
                        name={icon ?? variantProps.icon}
                    />
                </Flex>
            )}
            <Box flexGrow={1}>{children}</Box>
        </Flex>
    );
};
