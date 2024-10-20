import {t} from "@dashdoc/web-core";
import {IconButton} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";
import {useHistory} from "react-router";

import {DeleteTransportModal} from "app/features/transport/actions/delete-transport-modal";
import {fetchDeleteTransport} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {getFullPathToBusinessStatus} from "app/types/businessStatus";

type Props = {
    transportUid: string;
    transportCarrierPk: number | undefined;
    companyPk: number | undefined;
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
    onTransportDeleted?: () => void;
    refetchTransports?: (onlyCounters?: boolean) => void;
    clearPopoverState?: () => void;
};
export function DeleteButton({
    transportUid,
    transportCarrierPk,
    companyPk,
    isLoading,
    setIsLoading,
    onTransportDeleted,
    refetchTransports,
    clearPopoverState,
}: Props) {
    const [isModalOpened, open, close] = useToggle();
    const dispatch = useDispatch();
    const history = useHistory();
    return (
        <>
            <IconButton
                ml={2}
                name="delete"
                onClick={open}
                label={t("common.delete")}
                disabled={isLoading}
                data-testid="transport-detail-delete"
            />
            {isModalOpened && (
                <DeleteTransportModal onClose={handleClose} onDelete={deleteTransport} />
            )}
        </>
    );

    async function deleteTransport() {
        setIsLoading(true);
        try {
            await dispatch(fetchDeleteTransport(transportUid));
            if (onTransportDeleted) {
                onTransportDeleted();
            } else {
                if (transportCarrierPk === companyPk) {
                    history.push(getFullPathToBusinessStatus("transports_deleted_or_declined"));
                } else {
                    history.push(getFullPathToBusinessStatus("orders_deleted"));
                }
            }
            refetchTransports?.(/*onlyCounters*/ true);
        } finally {
            setIsLoading(false);
            handleClose();
        }
    }

    function handleClose() {
        close();
        clearPopoverState?.();
    }
}
