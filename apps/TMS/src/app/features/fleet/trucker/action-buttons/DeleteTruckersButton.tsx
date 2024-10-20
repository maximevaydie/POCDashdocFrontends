import {getConnectedManager, managerService, useDispatch, useSelector} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, ConfirmationModal, IconButton, LoadingWheel, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {fetchDeleteTrucker, unselectAllRows} from "app/redux/actions";
import {RootState} from "app/redux/reducers/index";
import {getTruckersCurrentQueryLoadingStatus} from "app/redux/selectors";
import {TruckersScreenQuery} from "app/screens/fleet/truckers/TruckersScreen";

type Props = {
    currentSelection: string[];
    currentQuery: TruckersScreenQuery;
    fetchTruckers: (query: TruckersScreenQuery) => void;
};

export function DeleteTruckersButton({currentSelection, currentQuery, fetchTruckers}: Props) {
    const [isDeleteModalOpened, openDeleteModal, closeDeleteModal] = useToggle();
    const dispatch = useDispatch();
    const isLoading = useSelector(getTruckersCurrentQueryLoadingStatus);

    const hasEditAccess = useSelector((state: RootState) =>
        managerService.hasAtLeastUserRole(getConnectedManager(state))
    );
    if (!hasEditAccess) {
        return null;
    }

    return (
        <>
            <IconButton
                name="bin"
                label={t("common.delete")}
                onClick={openDeleteModal}
                ml={2}
                data-testid="truckers-screen-delete-button"
            />
            {isDeleteModalOpened && (
                <ConfirmationModal
                    title={t("trucker.deleteItemsTitle", {
                        smart_count: currentSelection.length,
                    })}
                    confirmationMessage={
                        <DeleteModalBody
                            isLoading={isLoading}
                            currentSelection={currentSelection}
                        />
                    }
                    onClose={closeDeleteModal}
                    mainButton={{
                        onClick: () => bulkDeleteTruckers(),
                        severity: "danger",
                        children: t("trucker.deleteTruckers"),
                    }}
                />
            )}
        </>
    );
    function bulkDeleteTruckers() {
        closeDeleteModal();
        Promise.all(
            currentSelection.map((trucker) => {
                dispatch(fetchDeleteTrucker(trucker as unknown as number));
            })
        ).then(() => {
            dispatch(unselectAllRows("truckers"));
            fetchTruckers(currentQuery);
        });
    }
}

function DeleteModalBody({
    isLoading,
    currentSelection,
}: {
    isLoading: boolean;
    currentSelection: string[];
}) {
    if (isLoading) {
        return <LoadingWheel noMargin />;
    }
    return (
        <Box>
            <Text>{t("trucker.dataWillBeDeletedForEver")}</Text>
            <Text>
                {t("trucker.confirmDeleteTruckers", {
                    smart_count: currentSelection.length,
                })}
            </Text>
        </Box>
    );
}
