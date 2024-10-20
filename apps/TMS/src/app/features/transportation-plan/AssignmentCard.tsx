import {useFeatureFlag} from "@dashdoc/web-common";
import {Box, Card} from "@dashdoc/web-ui";
import {Company, Pricing} from "dashdoc-utils";
import * as React from "react";

import {useRefreshTransportLists} from "app/hooks/useRefreshTransportLists";
import {
    fetchSetTransportCarrier,
    fetchSetTransportCarrierAddress,
} from "app/redux/actions/transports";
import {useDispatch} from "app/redux/hooks";
import {transportViewerService} from "app/services/transport/transportViewer.service";

import {CarrierOffers} from "./carrier-offer/CarrierOffers";
import {DeleteQuotationRequest} from "./rfq/quotation-request/components/DeleteQuotationRequest";
import {QuotationRequest} from "./rfq/quotation-request/QuotationRequest";
import {carrierApprovalService} from "./services/carrierApproval.service";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    company: Company | null;
    agreedPrice: Pricing | null;
    onAssign: () => void;
    onConfirmAssignation: () => void;
    onCancelAssignation: () => void;
    onAbortOffer: () => Promise<unknown>;
};

export function AssignmentCard({
    transport,
    company,
    agreedPrice,
    onAssign,
    onConfirmAssignation,
    onCancelAssignation,
    onAbortOffer,
}: Props) {
    const dispatch = useDispatch();
    const transportListRefresher = useRefreshTransportLists();
    const hasBetterCompanyRolesEnabled = useFeatureFlag("betterCompanyRoles");

    const carrierApprovalStatus = carrierApprovalService.getStatus(transport);

    if (!["requested", "declined", "ordered"].includes(carrierApprovalStatus)) {
        return null;
    }

    const canDisplayTransportOffers =
        transportViewerService.isShipperOf(transport, company?.pk) ||
        transportViewerService.isCreatorOf(transport, company?.pk);

    const canDisplayQuotationRequest =
        transportViewerService.isShipperOf(transport, company?.pk) ||
        transportViewerService.isCreatorOf(transport, company?.pk);

    const content: React.ReactNode =
        transport.carrier_quotation_request && carrierApprovalStatus === "ordered" ? (
            <Box p={4} flexGrow={1}>
                <QuotationRequest transport={transport} />
            </Box>
        ) : (
            <Box p={4} flexGrow={1}>
                <CarrierOffers
                    transport={transport}
                    agreedPrice={agreedPrice}
                    company={company}
                    onAssign={onAssign}
                    onConfirmAssignation={onConfirmAssignation}
                    onCancelAssignation={onCancelAssignation}
                    onAbortOffer={async () => {
                        if (hasBetterCompanyRolesEnabled) {
                            await dispatch(fetchSetTransportCarrier(transport.uid, null, {}));
                        } else {
                            await dispatch(
                                fetchSetTransportCarrierAddress(transport.uid, null, {})
                            );
                        }
                        transportListRefresher();
                        onAbortOffer();
                    }}
                />
            </Box>
        );

    const assignmentCard: React.ReactNode =
        canDisplayTransportOffers || canDisplayQuotationRequest ? (
            <Card mb={4}>{content}</Card>
        ) : null;

    return (
        <>
            {assignmentCard}
            {canDisplayQuotationRequest && transport.carrier_quotation_request && (
                <Card mb={4} px={4}>
                    <DeleteQuotationRequest
                        quotationRequest={transport.carrier_quotation_request}
                        onDeleted={handleQuotationRequestDeleted}
                    />
                </Card>
            )}
        </>
    );

    async function handleQuotationRequestDeleted() {
        transportListRefresher();
    }
}
