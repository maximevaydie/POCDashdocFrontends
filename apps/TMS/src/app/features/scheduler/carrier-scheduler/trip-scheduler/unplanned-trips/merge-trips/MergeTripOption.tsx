import {ClickableFlex, Text, Icon, Box, IconNames, Flex} from "@dashdoc/web-ui";
import React from "react";

export function MergeTripOption({
    icon,
    label,
    description,
    onClick,
    testId,
    isLoading,
}: {
    icon: IconNames;
    label: string;
    description: string;
    onClick: () => void;
    testId: string;
    isLoading: boolean;
}) {
    return (
        <ClickableFlex
            onClick={isLoading ? () => {} : onClick}
            disabled={isLoading}
            data-testid={testId}
            p={2}
            hoverStyle={{
                backgroundColor: "blue.ultralight",
                borderRadius: 1,
                color: "blue.dark",
            }}
            justifyContent="flex-start"
        >
            <Box>
                <Icon name={icon} mr={2} />
            </Box>
            <Box>
                <Text color={isLoading ? "grey.default" : "inherit"}>{label}</Text>
                <Flex>
                    <Text variant="caption" color="grey.dark" maxWidth="250px">
                        {description}
                    </Text>
                </Flex>
            </Box>
        </ClickableFlex>
    );
}
