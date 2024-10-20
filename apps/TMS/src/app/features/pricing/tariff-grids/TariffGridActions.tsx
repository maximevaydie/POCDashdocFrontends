import {guid} from "@dashdoc/core";
import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Icon, IconButton, Popover, Text, theme} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FC, useState} from "react";
import {useHistory} from "react-router";

import {DuplicationModal} from "./modals/DuplicationModal";
import {modalService} from "./modals/modal.service";
import {RenameModal} from "./modals/RenameModal";
import {TariffGrid, TariffGridOwnerType} from "./types";

interface TariffGridActionsProps {
    tariffGrid: TariffGrid;
    onRefresh: () => unknown;
}

const DeleteTariffGridConfirmationMessage = ({tariffGrid}: {tariffGrid: TariffGrid}) => {
    const isPurchaseTariffGrid = tariffGrid.owner_type === TariffGridOwnerType.SHIPPER;

    return (
        <>
            <Text>{t("tariffGrids.deleteTariffGridName", {name: tariffGrid.name})}</Text>
            <Flex mt={4}>
                <Icon name="removeCircle" color="red.dark" mr={1} />
                <Text>{t("tariffGrids.willNoLongerApply")}</Text>
            </Flex>
            <Flex mt={4}>
                <Box>
                    <Icon name="removeCircle" color="red.dark" mr={1} verticalAlign={"middle"} />
                </Box>
                <Flex flexDirection={"column"}>
                    <Text>
                        {t(
                            isPurchaseTariffGrid
                                ? "tariffGrids.shipperPricesWillBeRemoved"
                                : "tariffGrids.pricesWillBeRemoved"
                        )}
                    </Text>
                    {!isPurchaseTariffGrid && (
                        <Text variant="caption" color="grey.dark">
                            {t("tariffGrids.exceptInvoicedTransports")}
                        </Text>
                    )}
                </Flex>
            </Flex>
            <Text mt={4}>{t("tariffGrids.confirmDelete")}</Text>
        </>
    );
};

export const TariffGridActions: FC<TariffGridActionsProps> = ({tariffGrid, onRefresh}) => {
    const history = useHistory();
    const [key, setKey] = useState("_");
    const clearPopoverState = () => setKey(guid());
    const [renameModalVisible, setRenameModalVisible, setRenameModalHidden] = useToggle();
    const [duplicateModalVisible, setDuplicateModalVisible, setDuplicateModalHidden] = useToggle();
    return (
        <Flex alignItems="stretch">
            <Popover key={key}>
                <Popover.Trigger>
                    <IconButton name="moreActions" data-testid="tariff-grid-more-actions-button" />
                </Popover.Trigger>
                <Popover.Content>
                    <Button
                        justifyContent="flex-start"
                        data-testid="rename-tariff-grid-button"
                        variant="plain"
                        color={`${theme.colors.grey.dark} !important`}
                        onClick={setRenameModalVisible}
                    >
                        <Flex alignContent="flex-start">
                            <Icon name="edit" mr={2} />
                            {t("common.rename")}
                        </Flex>
                    </Button>
                    {renameModalVisible && (
                        <RenameModal
                            onClose={() => {
                                setRenameModalHidden();
                                clearPopoverState();
                            }}
                            tariffGrid={tariffGrid}
                            afterRename={() => {
                                setRenameModalHidden();
                                clearPopoverState();
                                onRefresh();
                            }}
                        />
                    )}
                    <Button
                        justifyContent="flex-start"
                        data-testid="duplicate-tariff-grid-button"
                        variant="plain"
                        color={`${theme.colors.grey.dark} !important`}
                        onClick={setDuplicateModalVisible}
                    >
                        <Flex alignContent="flex-start">
                            <Icon name="duplicate" mr={2} />
                            {t("components.duplicate")}
                        </Flex>
                    </Button>
                    {duplicateModalVisible && (
                        <DuplicationModal
                            onClose={() => {
                                setDuplicateModalHidden();
                                clearPopoverState();
                            }}
                            tariffGrid={tariffGrid}
                            afterDuplication={(tariffGrid) => {
                                setDuplicateModalHidden();
                                clearPopoverState();
                                history.push(`/app/tariff-grids/${tariffGrid.uid}`);
                            }}
                        />
                    )}
                    <Button
                        justifyContent="flex-start"
                        data-testid="delete-tariff-grid-button"
                        variant="plain"
                        color={`${theme.colors.grey.dark} !important`}
                        onClick={async () => {
                            await modalService.delete(tariffGrid.uid);
                            clearPopoverState();
                            onRefresh();
                        }}
                        withConfirmation
                        modalProps={{
                            title: t("tariffGrids.DeletionModalTitle"),
                            mainButton: {
                                children: t("common.delete"),
                            },
                        }}
                        confirmationMessage={
                            <DeleteTariffGridConfirmationMessage tariffGrid={tariffGrid} />
                        }
                    >
                        <Flex alignContent="flex-start">
                            <Icon name="delete" mr={2} />
                            {t("common.delete")}
                        </Flex>
                    </Button>
                </Popover.Content>
            </Popover>
        </Flex>
    );
};
