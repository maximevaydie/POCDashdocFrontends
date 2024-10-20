import {t} from "@dashdoc/web-core";
import {ClickableFlex, Text, Icon, Flex, IconButton, Box} from "@dashdoc/web-ui";
import React from "react";

import {TransportFormSupportExchange} from "../transport-form.types";
import {TEST_ID_PREFIX} from "../TransportForm";

interface SupportExchangeItemProps {
    supportExchange: TransportFormSupportExchange;
    index: number;
    isEditing: boolean;
    tagColor: string | null;
    tagText: string | null;
    onEdit: () => void;
    onDelete: () => void;
}

export function SupportExchangeItem({
    supportExchange,
    index,
    isEditing,
    tagColor,
    tagText,
    onEdit,
    onDelete,
}: SupportExchangeItemProps) {
    return (
        <ClickableFlex
            key={index}
            p={3}
            bg={isEditing ? "grey.light" : undefined}
            borderBottom="1px solid"
            borderColor="grey.light"
            onClick={() => onEdit()}
            justifyContent="space-between"
            alignItems="center"
        >
            <Text
                flex={1}
                data-testid={`${TEST_ID_PREFIX}support-exchange-type-${index}`}
                display="flex"
            >
                <Icon name="loading" mr={2} />
                {supportExchange.type.name}
            </Text>
            <Flex alignItems="center">
                <Text
                    data-testid={`${TEST_ID_PREFIX}support-exchange-number-${index}`}
                    display="flex"
                >
                    <Icon name="arrowUp" mr={1} />
                    {supportExchange.expectedRetrieved}
                    <Icon name="arrowDown" mr={1} ml={3} />
                    {supportExchange.expectedDelivered}
                </Text>

                <Text
                    borderRadius={1}
                    p={1}
                    width="80px"
                    backgroundColor={tagColor ? tagColor + ".ultralight" : "grey.light"}
                    color={tagColor ? tagColor + ".dark" : "grey.ultradark"}
                    textAlign="center"
                    fontSize={0}
                    lineHeight={0}
                    ml={4}
                    data-testid={`${TEST_ID_PREFIX}support-exchange-site-${index}`}
                >
                    {tagText}
                </Text>

                <IconButton name="edit" ml={4} />
                <Box onClick={(e) => e.stopPropagation()}>
                    <IconButton
                        name="delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        withConfirmation
                        confirmationMessage={t("components.deleteSupportExchangeMessage")}
                        modalProps={{
                            title: t("components.deleteSupportExchange"),
                            mainButton: {
                                children: t("common.delete"),
                            },
                        }}
                    />
                </Box>
            </Flex>
        </ClickableFlex>
    );
}
