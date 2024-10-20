import {Box, Flex} from "@dashdoc/web-ui";
import {Company, Pricing} from "dashdoc-utils";
import React, {useEffect, useState} from "react";

import {AssignAction} from "app/features/transportation-plan/assign/AssignAction";
import {CarrierDraftAssigned} from "app/features/transportation-plan/carrier-draft-assigned/CarrierDraftAssigned";
import {OffersHeader} from "app/features/transportation-plan/carrier-offer/components/OffersHeader";
import {useCarrierOffers} from "app/features/transportation-plan/carrier-offer/hooks/useCarrierOffers";

import {carrierApprovalService} from "../services/carrierApproval.service";
import {CarrierApprovalStatus} from "../types";

import {CancelableOffer} from "./components/CancelableOffer";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    agreedPrice: Pricing | null;
    company: Company | null;
    onAssign: () => void;
    onConfirmAssignation: () => void;
    onCancelAssignation: () => void;
    onAbortOffer: () => Promise<unknown>;
};

export function CarrierOffers({
    transport,
    agreedPrice,
    company,
    onAssign,
    onConfirmAssignation,
    onCancelAssignation,
    onAbortOffer,
}: Props) {
    const [status, setStatus] = useState<CarrierApprovalStatus | undefined>(undefined);
    const carrierApprovalStatus = carrierApprovalService.getStatus(transport);
    const {carrierOffersCount} = useCarrierOffers(transport, agreedPrice);

    useEffect(() => {
        // when the transport is update, the status should be sync
        setStatus(carrierApprovalStatus);
    }, [carrierApprovalStatus]);

    let content;
    if (status === "requested") {
        content = (
            <CancelableOffer
                transport={transport}
                agreedPrice={agreedPrice}
                onAbort={async () => {
                    try {
                        setStatus("ordered");
                        await onAbortOffer();
                    } catch (e) {
                        //fallback
                        setStatus("requested");
                        throw e; // rethrow
                    }
                }}
            />
        );
    } else if (status === "ordered" || status === "declined") {
        if (transport.carrier_assignation_status === "draft_assigned") {
            content = (
                <CarrierDraftAssigned
                    transport={transport}
                    agreedPrice={agreedPrice}
                    onConfirmAssignation={onConfirmAssignation}
                    onCancelAssignation={onCancelAssignation}
                />
            );
        } else {
            content = (
                <Flex flexDirection={"row"} alignItems={"center"}>
                    <Box flexGrow={1} pr={4}>
                        <OffersHeader offersCount={carrierOffersCount} />
                    </Box>
                    <AssignAction
                        transport={transport}
                        company={company}
                        carrierOffersCount={carrierOffersCount}
                        onAssign={onAssign}
                    />
                </Flex>
            );
        }
    } else {
        return null;
    }

    return (
        <Box flexGrow={1} data-testid="transport-carrier-offers">
            {content}
        </Box>
    );
}
