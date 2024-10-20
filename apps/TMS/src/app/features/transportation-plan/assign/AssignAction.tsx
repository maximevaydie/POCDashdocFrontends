import {apiService} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Button, toast} from "@dashdoc/web-ui";
import {Company, useToggle} from "dashdoc-utils";
import React from "react";

import {SubcontractSubmit} from "app/features/transportation-plan/types";
import {useRefreshTransportLists} from "app/hooks/useRefreshTransportLists";
import {fetchRetrieveTransport} from "app/redux/actions/transports";
import {useDispatch} from "app/redux/hooks";

import {AssignModal} from "./AssignModal";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    company: Company | null;
    carrierOffersCount: number;
    onAssign: () => void;
};

export function AssignAction({transport, company, carrierOffersCount, onAssign}: Props) {
    const [isModalOpen, openModal, closeModal] = useToggle();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting, setIsSubmitted] = useToggle();
    const transportListRefresher = useRefreshTransportLists();

    return (
        <>
            <Button
                variant="primary"
                disabled={isSubmitting}
                onClick={openModal}
                data-testid="assign-carrier-button"
            >
                {t("chartering.actions.assign")}
            </Button>
            {isModalOpen && (
                <AssignModal
                    onClose={closeModal}
                    transport={transport}
                    company={company}
                    isSubmitting={isSubmitting}
                    onAssign={handleAssign}
                    carrierOffersCount={carrierOffersCount}
                />
            )}
        </>
    );

    async function handleAssign(charterProps: SubcontractSubmit) {
        try {
            setIsSubmitting();
            await apiService.Transports.assignCarrier(transport.uid, charterProps, {
                apiVersion: "v4",
            });
            toast.success(t("chartering.charterSuccess"));
            dispatch(fetchRetrieveTransport(transport.uid));
            transportListRefresher();
            onAssign();
            closeModal();
        } catch (error) {
            Logger.error(error);
            toast.error(t("chartering.charterError"));
        } finally {
            setIsSubmitted();
        }
    }
}
