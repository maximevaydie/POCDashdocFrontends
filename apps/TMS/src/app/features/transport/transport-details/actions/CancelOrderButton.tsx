import {t} from "@dashdoc/web-core";
import {IconButton} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import CancelTransportModal from "app/features/transport/actions/cancel-transport-modal";

type Props = {
    transportUid: string;
    isLoading: boolean;
    refetchTransports?: (onlyCounters?: boolean) => void;
    clearPopoverState?: () => void;
};
export function CancelOrderButton({
    transportUid,
    isLoading,
    refetchTransports,
    clearPopoverState,
}: Props) {
    const [isModalOpened, open, close] = useToggle(false);

    return (
        <>
            <IconButton
                ml={2}
                name="cancel"
                onClick={open}
                label={t("common.cancel")}
                disabled={isLoading}
                data-testid="transport-detail-cancel"
            />
            {isModalOpened && (
                <CancelTransportModal
                    onClose={handleClose}
                    refetchTransports={refetchTransports}
                    transportUid={transportUid}
                />
            )}
        </>
    );

    function handleClose() {
        close();
        clearPopoverState?.();
    }
}
