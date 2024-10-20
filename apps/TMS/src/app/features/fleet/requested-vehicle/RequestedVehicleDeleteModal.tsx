import {t} from "@dashdoc/web-core";
import {Box, Text, ConfirmationModal, LoadingWheel} from "@dashdoc/web-ui";
import {RequestedVehicle} from "dashdoc-utils";
import React from "react";

import {requestedVehiclesApiService} from "app/services/fleet-management/requested-vehicles/requestedVehiclesApi.service";

export type RequestedVehicleDeleteModalProps = {
    closeDeleteModal: () => void;
    onConfirm: () => void;
    currentSelection: string[];
    requestedVehicles: RequestedVehicle[];
    isLoading: boolean;
};

export default function RequestedVehicleDeleteModal({
    closeDeleteModal,
    onConfirm,
    currentSelection,
    requestedVehicles,
    isLoading,
}: RequestedVehicleDeleteModalProps) {
    const renderDeleteModalBody = () => {
        if (isLoading) {
            return <LoadingWheel noMargin />;
        }
        return (
            <Box>
                <Text>{t("components.requestedVehicle.dataWillBeDeletedForEver")}</Text>
                <Text>
                    {t("components.requestedVehicle.confirmDelete", {
                        smart_count: currentSelection.length,
                    })}
                </Text>
            </Box>
        );
    };

    const deleteRequestedVehicles = () => {
        const toDelete = requestedVehicles.filter((requestedVehicle) =>
            currentSelection.includes(requestedVehicle.uid)
        );
        closeDeleteModal();
        Promise.all(
            toDelete.map((requestedVehicle) => {
                requestedVehiclesApiService.delete(requestedVehicle.uid, requestedVehicles);
            })
        ).then(() => {
            onConfirm();
        });
    };

    return (
        <ConfirmationModal
            title={t("components.requestedVehicle.deleteModalTitle", {
                smart_count: currentSelection.length,
            })}
            confirmationMessage={renderDeleteModalBody()}
            onClose={closeDeleteModal}
            mainButton={{
                onClick: () => deleteRequestedVehicles(),
                severity: "danger",
                children: t("components.requestedVehicle.delete"),
            }}
            secondaryButton={{}}
        />
    );
}
