import {t} from "@dashdoc/web-core";
import {Modal} from "@dashdoc/web-ui";
import {PlannedQuantities, PricingQuantities} from "dashdoc-utils";
import React from "react";

import {InvoiceItemSuggestionArguments} from "app/features/pricing/invoices/invoice-item/invoice-item-suggestion";
import {useMatchingFuelSurchargeAgreementFromTransportUid} from "app/features/pricing/useMatchingFuelSurchargeAgreement";
import {useMatchingTariffGridsFromTransportUid} from "app/hooks/useMatchingTariffGrids";
import {PricingFormData} from "app/services/invoicing";

import {PricingForm} from "./pricing-form/PricingForm";

import type {Transport} from "app/types/transport";

type PricingModalProps = {
    initialPricing: PricingFormData;
    readOnly?: boolean;
    initialRealQuantities?: PricingQuantities;
    initialPlannedQuantities?: PlannedQuantities;
    isPricing?: boolean;
    onClose: () => void;
    onSubmitPricing: (pricing: PricingFormData) => void;
    isCarrierOfTransport: boolean;
    isOwnerOfCurrentFuelSurchargeAgreement: boolean;
    transport?: Transport;
};

export default function PricingModal({
    initialPricing,
    initialRealQuantities,
    initialPlannedQuantities,
    readOnly,
    isPricing,
    isCarrierOfTransport,
    isOwnerOfCurrentFuelSurchargeAgreement,
    transport,
    onClose,
    onSubmitPricing,
}: PricingModalProps) {
    const matchingTariffGrids = useMatchingTariffGridsFromTransportUid(
        transport?.uid,
        isPricing ? "PRICING" : "QUOTATION"
    );
    const matchingFuelSurchargeAgreement = useMatchingFuelSurchargeAgreementFromTransportUid(
        transport?.uid,
        isPricing ? "pricing" : "quotation"
    );
    const invoiceItemSuggestionArguments: InvoiceItemSuggestionArguments = {
        customerToInvoiceId: transport?.customer_to_invoice?.pk,
        shipperId: transport?.shipper?.pk,
    };

    let title;

    if (isPricing) {
        title = readOnly ? t("components.invoicedPriceLabel") : t("invoicedPriceModal.title");
    } else {
        title = readOnly
            ? t("transportColumns.agreedUponPrice")
            : t("components.agreedPriceModification");
    }

    return (
        <Modal
            id="pricing-modal"
            data-testid="pricing-modal"
            size="xlarge"
            title={title}
            onClose={onClose}
            secondaryButton={readOnly ? {children: t("common.close")} : null}
            mainButton={
                !readOnly
                    ? {
                          ["data-testid"]: "submit-pricing-form-button",
                          children: t("common.save"),
                          type: "submit",
                          form: "pricing-form",
                      }
                    : null
            }
        >
            <PricingForm
                isCarrierOfTransport={isCarrierOfTransport}
                isOwnerOfCurrentFuelSurchargeAgreement={isOwnerOfCurrentFuelSurchargeAgreement}
                initialPricing={initialPricing}
                initialRealQuantities={initialRealQuantities}
                initialPlannedQuantities={initialPlannedQuantities}
                onSubmit={onSubmitPricing}
                readOnly={readOnly}
                matchingTariffGridInfos={matchingTariffGrids}
                matchingFuelSurchargeAgreement={matchingFuelSurchargeAgreement}
                invoiceItemSuggestionArguments={invoiceItemSuggestionArguments}
            />
        </Modal>
    );
}
