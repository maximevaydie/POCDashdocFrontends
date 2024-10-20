import {
    getConnectedCompany,
    getErrorMessageFromServerError,
    useSelector,
} from "@dashdoc/web-common";
import {toast} from "@dashdoc/web-ui";
import React from "react";

import {PricingForm} from "app/features/pricing/pricing-form/PricingForm";
import {BulkSetInvoiceItemResponse} from "app/features/transport/actions/bulk/set-invoice-item-or-pricing/BulkSetInvoiceItemForm";
import {fetchBulkSetPricing} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";
import {PricingFormData, getInitialPricingForm} from "app/services/invoicing";

interface BulkSetPricingFormProps {
    selectedTransportsQuery: SearchQuery;
    setStatus: (status: "pending" | "loading" | "done") => void;
    setResult: (
        result: BulkSetInvoiceItemResponse["response"] | BulkSetPricingResponse["response"] | null
    ) => void;
}

export type BulkSetPricingResponse = {
    response: {
        success_count: number;
        failure_count: number;
        errors: {[key in BulkSetPricingError]: {uid: string; sequential_id: number}[]};
    };
};

// To keep in sync with BulkSetPricingErrorType
export type BulkSetPricingError =
    | "transport_without_pricing"
    | "transport_invoiced"
    | "transport_not_done";

export type BulkSetPricing = {
    lines: {
        invoice_item_uid: string | null;
        description: string;
        metric: string;
        quantity: string | null;
        unit_price: string;
        is_gas_indexed: boolean;
    }[];
};

export const BulkSetPricingForm = ({
    selectedTransportsQuery,
    setStatus,
    setResult,
}: BulkSetPricingFormProps) => {
    const dispatch = useDispatch();
    const connectedCompany = useSelector(getConnectedCompany);

    return (
        <PricingForm
            formId="bulk-set-pricing-form"
            isCarrierOfTransport
            isOwnerOfCurrentFuelSurchargeAgreement
            hideHeaderInformation
            hideGasIndexButton
            initialPricing={getInitialPricingForm(null, connectedCompany)}
            onSubmit={handleSubmit}
            matchingTariffGridInfos={[]}
            matchingFuelSurchargeAgreement={null}
            displayTariffGrids={false}
            canPricingBeEmpty={false}
        />
    );

    function computePricingBeforeSubmit(pricingForm: PricingFormData): BulkSetPricing {
        return {
            lines: pricingForm.lines.map((line) => ({
                invoice_item_uid: line.invoice_item?.uid ?? null,
                description: line.description,
                metric: line.metric,
                quantity:
                    line.quantity === "" || line.quantity === null
                        ? null
                        : line.quantity.toString(),
                unit_price: line.unit_price.toString(),
                is_gas_indexed: line.is_gas_indexed,
            })),
        };
    }

    async function handleSubmit(pricingForm: PricingFormData, hasErrors: boolean) {
        if (hasErrors) {
            return;
        }

        setStatus("loading");
        try {
            const computedPricing = computePricingBeforeSubmit(pricingForm);
            const bulkSetPricingResponse: BulkSetPricingResponse = await dispatch(
                fetchBulkSetPricing(computedPricing, selectedTransportsQuery)
            );

            setResult(bulkSetPricingResponse.response);
            setStatus("done");
        } catch (error) {
            const errorMessage = await getErrorMessageFromServerError(error);
            toast.error(errorMessage);
            setStatus("pending");
        }
    }
};
