import {t} from "@dashdoc/web-core";
import {BoxProps, Flex, Icon, IconNames, Text} from "@dashdoc/web-ui";
import React, {ReactText, type ReactNode} from "react";

type Props = {
    valuePrefix?: ReactText;
    children?: ReactNode;
    icon?: IconNames;
} & BoxProps;

export function InfoItem({valuePrefix, icon, children, ...props}: Props) {
    let content: ReactNode;
    if (!children || typeof children === "string" || typeof children === "number") {
        const valueLabel = children ? children : t("common.unspecified");
        content = (
            <Text as="span">
                {valuePrefix && (
                    <Text color="grey.dark" as="i" fontStyle="normal">
                        {valuePrefix}
                    </Text>
                )}
                <Text as="i" fontStyle="normal">
                    {valueLabel}
                </Text>
            </Text>
        );
    } else {
        content = (
            <>
                <Text as="span">
                    {valuePrefix && (
                        <Text
                            color="grey.dark"
                            as="i"
                            fontStyle="normal"
                            style={{whiteSpace: "nowrap"}}
                        >
                            {valuePrefix}
                        </Text>
                    )}
                </Text>
                {children}
            </>
        );
    }
    return (
        <Flex alignItems="baseline" {...props}>
            {icon && <Icon name={icon} mr={3} color="grey.dark" />}
            {content}
        </Flex>
    );
}
