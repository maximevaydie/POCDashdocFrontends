import {apiService} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Button, Icon, ButtonProps, toast} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {BulkAssignModal} from "app/features/transportation-plan/assign/BulkAssignModal";
import {SubcontractSubmit} from "app/features/transportation-plan/types";
import {useRefreshTransportLists} from "app/hooks/useRefreshTransportLists";
import {SearchQuery} from "app/redux/reducers/searches";

type Props = {
    query: SearchQuery;
    onClose?: () => void;
    buttonProps?: ButtonProps;
    label?: string;
};

export function BulkAssignAction({query, onClose, buttonProps, label}: Props) {
    const [isModalOpen, openModal, closeModal] = useToggle();
    const [isSubmitting, setIsSubmitting, setIsSubmitted] = useToggle();
    const transportListRefresher = useRefreshTransportLists();

    return (
        <>
            <Button
                variant="plain"
                disabled={isSubmitting}
                onClick={openModal}
                data-testid="mass-assign-carrier-button"
                {...buttonProps}
            >
                {label ?? (
                    <>
                        <Icon name="truck" mr={1} />
                        {t("chartering.actions.assign")}
                    </>
                )}
            </Button>
            {isModalOpen && (
                <BulkAssignModal
                    onClose={handleClose}
                    query={query}
                    isSubmitting={isSubmitting}
                    onAssign={handleAssign}
                />
            )}
        </>
    );

    function handleClose() {
        closeModal();
        onClose?.();
    }

    async function handleAssign(charterProps: SubcontractSubmit) {
        try {
            setIsSubmitting();
            await apiService.Transports.bulkAssignCarrier(query, charterProps, {
                apiVersion: "v4",
            });
            toast.success(t("chartering.charterSuccess"));
            transportListRefresher();
            handleClose();
        } catch (error) {
            Logger.error(error);
            toast.error(t("chartering.charterError"));
        } finally {
            setIsSubmitted();
            onClose?.();
        }
    }
}
