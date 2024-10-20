import {t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import DeclineTransportsModal from "app/features/transport/actions/bulk/decline-transports-modal";

type Props = {
    transportUid: string;
    isLoading: boolean;
    isDeleted: boolean;
    refetchTransports?: (onlyCounters?: boolean) => void;
};
export function DeclineOrderButton({
    transportUid,
    isLoading,
    isDeleted,
    refetchTransports,
}: Props) {
    const [isModalOpen, open, close] = useToggle(false);
    return (
        <>
            <Button
                ml={2}
                key="decline-order"
                onClick={open}
                severity="danger"
                disabled={isDeleted || isLoading}
                data-testid="decline-order-button"
            >
                <Icon name="cancel" mr={2} />
                {t("common.decline")}
            </Button>
            {isModalOpen && (
                <DeclineTransportsModal
                    onClose={close}
                    selectedTransports={[transportUid]}
                    refetchTransports={refetchTransports}
                    bulk={false}
                />
            )}
        </>
    );
}
