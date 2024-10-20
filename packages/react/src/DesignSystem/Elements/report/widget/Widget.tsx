import {t} from "@dashdoc/web-core";
import {Box, Card, Flex, IconButton, Text} from "@dashdoc/web-ui";
import {BadgeList} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";
import {Link as ReactLink} from "react-router-dom";

export interface WidgetProps {
    id: number;
    name: string;
    tags: string[];
    count: number;
    onDelete?: () => void;
}

export const Widget: FunctionComponent<WidgetProps & {children: React.ReactNode}> = ({
    id,
    name,
    tags,
    children,
    onDelete,
}) => {
    return (
        <Card p={4} data-testid={"report-widget"}>
            <Box>
                <Flex justifyContent="space-between" mb={5}>
                    <Text variant="h1">{name}</Text>
                    <Flex alignItems="center">
                        <ReactLink to={`/app/reports/${id}`} data-testid="report-detail-link">
                            {t("components.reportLink")}
                        </ReactLink>
                        {onDelete && (
                            <IconButton
                                name="delete"
                                withConfirmation
                                confirmationMessage={t("components.confirmDeleteReport")}
                                modalProps={{
                                    title: t("components.deleteReport"),
                                    mainButton: {
                                        children: t("common.delete"),
                                        "data-testid": "confirm-delete",
                                    },
                                }}
                                data-testid="delete-button"
                                onClick={onDelete}
                                fontSize={2}
                                ml={2}
                            />
                        )}
                    </Flex>
                </Flex>
            </Box>
            <Box>{children}</Box>
            {tags?.length > 0 && (
                <Box borderTop="1px solid" borderColor="grey.light" mt={4} pt={3}>
                    <BadgeList values={tags} />
                </Box>
            )}
        </Card>
    );
};
