import {Logger, t} from "@dashdoc/web-core";
import {Box, IconButton, LoadingWheel} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useState} from "react";

import {fetchCancelTransport} from "app/redux/actions/transports";
import {useDispatch} from "app/redux/hooks";

import {DeleteSubcontractModal} from "./components/DeleteSubcontractModal";

type Props = {
    childTransportUid: string;
    isDeclined: boolean;
    isDraftAssigned: boolean;
    disabled?: boolean;
    isLoading?: boolean;
    onSuccess?: () => void;
};

export function DeleteSubcontractAction({
    childTransportUid,
    isDeclined,
    isDraftAssigned,
    disabled = false,
    isLoading = false,
    onSuccess,
}: Props) {
    const dispatch = useDispatch();
    const [isCancelling, setIsCancelling] = useState(false);
    const [
        isConfirmDeleteChildTransportModalOpen,
        openConfirmDeleteChildTransportModal,
        closeConfirmDeleteChildTransportModal,
    ] = useToggle();
    return (
        <Box width={32} height={32}>
            {isCancelling ? (
                <LoadingWheel noMargin />
            ) : (
                <IconButton
                    data-testid="cancel-chartering-button"
                    name="cancel"
                    title={t("chartering.cancelChartering")}
                    onClick={deleteChildTransportDirectlyOrOpenModal}
                    disabled={disabled}
                    loading={isLoading}
                />
            )}
            {isConfirmDeleteChildTransportModalOpen && (
                <DeleteSubcontractModal
                    charteredTransportUid={childTransportUid}
                    onSubmit={deleteChildTransport}
                    onClose={closeConfirmDeleteChildTransportModal}
                />
            )}
        </Box>
    );

    async function deleteChildTransport(reason: string) {
        try {
            setIsCancelling(true);
            await dispatch(fetchCancelTransport(childTransportUid, reason));
            await onSuccess?.();
            closeConfirmDeleteChildTransportModal();
        } catch (error) {
            Logger.error(error);
        } finally {
            setIsCancelling(false);
        }
    }

    async function deleteChildTransportDirectlyOrOpenModal() {
        if (isDeclined || isDraftAssigned) {
            // Skipping confirmation prompt
            await deleteChildTransport("");
        } else {
            openConfirmDeleteChildTransportModal();
        }
    }
}
