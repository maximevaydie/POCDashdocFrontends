import {getLoadText} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {ClickableFlex, Text, Icon, Flex, IconButton, Box} from "@dashdoc/web-ui";
import React, {useContext} from "react";

import {TransportFormContext} from "../transport-form-context";
import {FormLoad} from "../transport-form.types";

interface LoadItemProps {
    load: FormLoad;
    index: number;
    isLast: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export function LoadItem({load, index, isLast, onEdit, onDelete}: LoadItemProps) {
    const {volumeDisplayUnit} = useContext(TransportFormContext);

    return (
        <ClickableFlex
            padding={2}
            onClick={onEdit}
            justifyContent="space-between"
            borderBottom="1px solid"
            borderColor={isLast ? "transparent" : "grey.light"}
        >
            <Flex alignItems="center">
                <Icon name="load" marginRight={2} />
                <Text>
                    {getLoadText({
                        ...load,
                        volume_display_unit: volumeDisplayUnit,
                    })}
                </Text>
            </Flex>
            <Flex>
                <IconButton name="edit" ml={4} data-testid={`edit-load-button-${index}`} />
                <Box
                    onClick={(e) => e.stopPropagation()}
                    data-testid={`delete-load-button-${index}`}
                >
                    <IconButton
                        name="delete"
                        onClick={onDelete}
                        withConfirmation
                        confirmationMessage={t("components.confirmDeleteLoad")}
                        modalProps={{
                            title: t("components.confirmDeleteLoadTitle"),
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
