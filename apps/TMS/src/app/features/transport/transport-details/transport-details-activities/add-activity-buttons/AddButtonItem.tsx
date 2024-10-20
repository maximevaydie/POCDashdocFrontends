import {Box, ClickableFlex, Icon, IconNames, Text} from "@dashdoc/web-ui";
import React from "react";

export function AddOptionItem({
    icon,
    label,
    description,
    onClick,
    testId,
    disabled,
    isLast,
}: {
    icon: IconNames;
    label: string;
    description?: string;
    onClick: () => void;
    testId?: string;
    disabled?: boolean;
    isLast?: boolean;
}) {
    return (
        <>
            <ClickableFlex
                p={3}
                borderBottom={isLast ? "none" : "1px solid"}
                borderColor="grey.light"
                onClick={disabled ? () => {} : onClick}
                data-testid={testId}
                disabled={disabled}
            >
                <Icon name={icon} mr={3} />
                <Box>
                    <Text color={disabled ? "grey.default" : "inherit"}>{label}</Text>
                    {description && (
                        <Text variant="caption" color="grey.dark">
                            {description}
                        </Text>
                    )}
                </Box>
            </ClickableFlex>
        </>
    );
}
