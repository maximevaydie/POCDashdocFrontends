import {managerService, getConnectedManager, useDispatch} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, ConfirmationModal, IconButton, LoadingWheel, Text} from "@dashdoc/web-ui";
import {FleetItem, useToggle} from "dashdoc-utils";
import React from "react";

import {unselectAllRows} from "app/redux/actions/selections";
import {fetchDeleteTrailer} from "app/redux/actions/trailers";
import {fetchDeleteVehicle} from "app/redux/actions/vehicles";
import {useSelector} from "app/redux/hooks";
import {getFleetItemsCurrentQueryLoadingStatus} from "app/redux/selectors/searches";

import type {RootState} from "app/redux/reducers";

type Props = {
    fleetItems: FleetItem[];
    currentSelection: string[];
    onDeleteDone: () => void;
};

export function BulkDeleteFleetButton({fleetItems, currentSelection, onDeleteDone}: Props) {
    const [isDeleteModalOpened, openDeleteModal, closeDeleteModal] = useToggle();
    const dispatch = useDispatch();
    const hasEditAccess = useSelector((state: RootState) =>
        managerService.hasAtLeastUserRole(getConnectedManager(state))
    );
    if (!hasEditAccess) {
        return null;
    }

    return (
        <>
            <IconButton name="bin" label={t("common.delete")} onClick={openDeleteModal} ml={2} />
            {isDeleteModalOpened && (
                <ConfirmationModal
                    title={t("fleetItem.deleteItemsTitle", {
                        smart_count: currentSelection.length,
                    })}
                    confirmationMessage={<DeleteModalBody currentSelection={currentSelection} />}
                    onClose={closeDeleteModal}
                    mainButton={{
                        onClick: () => deleteFleetItems(currentSelection, fleetItems),
                        severity: "danger",
                        children: t("fleetItem.deleteItems"),
                    }}
                />
            )}
        </>
    );

    function deleteFleetItems(selection: string[], items: FleetItem[]) {
        const toDelete = items.filter((item) => selection.includes(getFleetItemId(item)));
        closeDeleteModal();
        Promise.all(
            toDelete.map((fleetItem) => {
                if (fleetItem.type === "vehicle") {
                    return dispatch(fetchDeleteVehicle(fleetItem));
                } else {
                    return dispatch(fetchDeleteTrailer(fleetItem));
                }
            })
        ).then(() => {
            dispatch(unselectAllRows("fleet-items"));
            onDeleteDone();
        });
    }
}

function DeleteModalBody({currentSelection}: {currentSelection: string[]}) {
    const isLoading = useSelector(getFleetItemsCurrentQueryLoadingStatus);
    if (isLoading) {
        return <LoadingWheel noMargin />;
    }
    return (
        <Box>
            <Text>{t("fleet.dataWillBeDeletedForEver")}</Text>
            <Text>
                {t("fleet.confirmDeleteFleetItems", {
                    smart_count: currentSelection.length,
                })}
            </Text>
        </Box>
    );
}

function getFleetItemId(fleetItem: FleetItem, overrideType?: "vehicle" | "trailer") {
    return `${overrideType || fleetItem.type}-${fleetItem.pk}`;
}
