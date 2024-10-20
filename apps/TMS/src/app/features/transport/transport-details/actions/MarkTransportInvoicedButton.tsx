import {t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {MarkInvoicedModal} from "app/features/transport/actions/mark-invoiced-modal";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    isLoading: boolean;
    isDeleted: boolean;
    isStatusButtonLoading: boolean;
    refetchTransports?: (onlyCounters?: boolean) => void;
};
export function MarkTransportInvoicedButton({
    transport,
    isLoading,
    isDeleted,
    isStatusButtonLoading,
    refetchTransports,
}: Props) {
    const [isModalOpened, open, close] = useToggle(false);
    return (
        <>
            <Button
                ml={2}
                data-testid="mark-invoiced-button"
                onClick={(e) => {
                    e.preventDefault();
                    refetchTransports?.();
                    open();
                }}
                loading={isStatusButtonLoading}
                disabled={isDeleted || isLoading}
            >
                <Icon name="check" mr={2} />
                {t("components.markInvoiced")}
            </Button>
            {isModalOpened && <MarkInvoicedModal transport={transport} onClose={close} />}
        </>
    );
}
