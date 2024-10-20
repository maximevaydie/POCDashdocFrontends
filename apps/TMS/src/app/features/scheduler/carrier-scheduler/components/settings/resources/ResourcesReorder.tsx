import {t} from "@dashdoc/web-core";
import {Box, Callout, Flex, LoadingWheel, ReorderableList, Text} from "@dashdoc/web-ui";
import {Item} from "@dashdoc/web-ui/src/choice/types";
import React from "react";

interface ResourcesReorderProps {
    resources: Item[];
    isLoading: boolean;
    onChange: (resources: Item[]) => void;
}

export function ResourcesReorder({resources, isLoading, onChange}: ResourcesReorderProps) {
    return (
        <Flex
            flexDirection="column"
            overflow="hidden"
            padding={4}
            backgroundColor="white"
            border="1px solid"
            borderColor="grey.light"
            width="100%"
            borderRadius={1}
            data-testid="scheduler-settings-resources-reorder-section"
        >
            <Text variant="h1" color="grey.dark" mb={2}>
                {t("scheduler.settings.reorderSection.title")}
            </Text>

            {isLoading ? (
                <Flex justifyContent="center">
                    <LoadingWheel small data-testid="loading-items" />
                </Flex>
            ) : resources.length ? (
                <Box overflow="scroll">
                    <ReorderableList items={resources} onChange={onChange} />
                </Box>
            ) : (
                <Callout marginTop={3}>
                    {t("scheduler.settings.reorderSection.placeholder")}
                </Callout>
            )}
        </Flex>
    );
}
