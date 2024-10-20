import {useTimezone} from "@dashdoc/web-common";
import {Box, LoadingWheel} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {carrierApprovalService} from "app/features/transportation-plan/services/carrierApproval.service";
import {fetchRetrieveTransport} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {getExpectedDeliveryDate} from "app/services/transport/transport.service";

import {CreateQuotationRequestAction} from "./components/CreateQuotationRequestAction";
import {QuotationSelector} from "./components/QuotationSelector";
import {useQuotationRequest} from "./useQuotationRequest";

import type {QuotationRequestPost} from "./types";
import type {Transport} from "app/types/transport";

type QuotationRequestProps = {
    transport: Transport;
};

/**
 * @guidedtour[epic=rfq] Shipper UX behavior
 * This QuotationRequest component allows to trigger a RFQ.
 * The user can follow the status of each quotations (pending/rejected/replied).
 * Finally, the user will select a quotation (or abort the request).
 * We must not display this component if the carrier has already been selected or if a draft assignation is set.
 */
export const QuotationRequest: FunctionComponent<QuotationRequestProps> = ({transport}) => {
    const dispatch = useDispatch();
    const {entity, loading, selectQuotation, createEntity} = useQuotationRequest(
        transport.carrier_quotation_request
    );
    const timezone = useTimezone();
    const carrierApprovalStatus = carrierApprovalService.getStatus(transport);
    const expectedDeliveryDate = getExpectedDeliveryDate(transport, timezone);

    if (!["declined", "ordered"].includes(carrierApprovalStatus)) {
        return null;
    }
    let content: React.ReactNode;
    if (loading) {
        content = <LoadingWheel />;
    } else if (entity !== null) {
        content = (
            <QuotationSelector
                quotationRequest={entity}
                expectedDeliveryDate={expectedDeliveryDate}
                onSelect={(quotation) => selectQuotation(quotation.uid)}
            />
        );
    } else {
        content = <CreateQuotationRequestAction transport={transport} onCreate={handleCreate} />;
    }
    return (
        <Box pb={4} flexGrow={1} data-testid="rfq">
            {content}
        </Box>
    );

    async function handleCreate(values: QuotationRequestPost) {
        await createEntity(values);
        dispatch(fetchRetrieveTransport(transport.uid));
    }
};
