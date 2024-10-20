import {apiService, getConnectedManager, managerService} from "@dashdoc/web-common";
import {t, Logger} from "@dashdoc/web-core";
import {ConfirmationModal, LoadingWheel, Box, Text, IconButton} from "@dashdoc/web-ui";
import React, {useState} from "react";
import {toast} from "react-toastify";

import {useSelector} from "app/redux/hooks";

type Props = {
    selectedTraces: number[];
    allTracesSelected: boolean;
    query: {license_plate__in: string[]; time__range: string[]};
    queryCount: number;
    onTracesDeleted: () => void;
};
export function DeleteTracesButton({
    selectedTraces,
    allTracesSelected,
    query,
    queryCount,
    onTracesDeleted,
}: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);
    const connectedManager = useSelector(getConnectedManager);

    return (
        <>
            {managerService.hasAtLeastUserRole(connectedManager) && (
                <IconButton
                    name="bin"
                    label={t("common.delete")}
                    color="blue.default"
                    ml={1}
                    onClick={() => {
                        if (selectedTraces.length > 0) {
                            setIsDeleteModalOpened(true);
                        } else {
                            toast.error(t("traces.pleaseSelectTraces"));
                        }
                    }}
                />
            )}
            {/* MODAL */}
            {isDeleteModalOpened && (
                <ConfirmationModal
                    confirmationMessage={
                        isDeleting ? (
                            <LoadingWheel noMargin />
                        ) : (
                            <Box>
                                <Text>{t("traces.dataWillBeDeletedForEver")}</Text>
                                <Text>
                                    {t("traces.confirmDeleteTraces", {
                                        tracesCount: allTracesSelected
                                            ? queryCount
                                            : selectedTraces.length,
                                    })}
                                </Text>
                            </Box>
                        )
                    }
                    onClose={() => setIsDeleteModalOpened(false)}
                    mainButton={{
                        onClick: deleteTraces,
                        children: t("traces.deleteTraces"),
                    }}
                />
            )}
        </>
    );

    async function deleteTraces() {
        setIsDeleting(true);
        try {
            if (allTracesSelected) {
                await apiService.Traces.deleteAll({
                    query,
                });
            } else {
                await apiService.Traces.deleteAll({query: {id__in: selectedTraces.join()}});
            }
            setIsDeleting(false);
            setIsDeleteModalOpened(false);
            onTracesDeleted();
        } catch (e) {
            Logger.error(e);
            toast.error(t("traces.couldNotDelete"));
            setIsDeleting(false);
            setIsDeleteModalOpened(false);
        }
    }
}
