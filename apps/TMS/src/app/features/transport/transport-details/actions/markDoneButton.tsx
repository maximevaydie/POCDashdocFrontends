import {t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {MarkDoneTransportWithDateModal} from "app/features/transport/actions/mark-transport-done-with-date-modal";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    disabled: boolean;
    loading: boolean;
};
export function MarkDoneButton({transport, disabled, loading}: Props) {
    const [isModalOpen, openModal, closeModal] = useToggle();
    return (
        <>
            <Button
                ml={2}
                key="markDoneButton"
                onClick={(e) => {
                    e.preventDefault();
                    openModal();
                }}
                loading={loading}
                data-testid="mark-transport-done-button"
                variant="primary"
                disabled={disabled}
            >
                <Icon name="check" mr={2} color="white" />
                {t("common.markDone")}
            </Button>
            {isModalOpen && (
                <MarkDoneTransportWithDateModal transport={transport} onClose={closeModal} />
            )}
        </>
    );
}
