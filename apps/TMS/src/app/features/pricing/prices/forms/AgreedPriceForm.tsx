import {useFeatureFlag} from "@dashdoc/web-common";
import {Box} from "@dashdoc/web-ui";
import {Company, Pricing} from "dashdoc-utils";
import React, {forwardRef, useRef} from "react";

import {fuelSurchargeService} from "app/features/pricing/fuel-surcharges/services/fuelSurcharge.service";
import {InvoiceItemSuggestionArguments} from "app/features/pricing/invoices/invoice-item/invoice-item-suggestion";
import {useMatchingFuelSurchargeAgreementFromTransportUid} from "app/features/pricing/useMatchingFuelSurchargeAgreement";
import {useMatchingTariffGridsFromTransportUid} from "app/hooks/useMatchingTariffGrids";
import {
    PricingFormData,
    getInitialPricingForm,
    invoicingRightService,
} from "app/services/invoicing";
import {transportViewerService} from "app/services/transport/transportViewer.service";

import {PricingForm} from "../../pricing-form/PricingForm";

import type {Transport} from "app/types/transport";

type Props = {
    connectedCompany: Company | null;
    transport: Transport;
    value: Pricing | null | undefined;
    hasShipperFinalPriceEnabled: boolean;
    onSubmit: (value: PricingFormData) => void;
    onCopyToFinalPrice?: () => void;
};

export const AgreedPriceForm = forwardRef(
    (
        {
            connectedCompany,
            transport,
            value,
            hasShipperFinalPriceEnabled,
            onSubmit,
            onCopyToFinalPrice,
        }: Props,
        ref
    ) => {
        const isCarrierOfTransport = transportViewerService.isCarrierOf(
            transport,
            connectedCompany?.pk
        );

        const isOwnerOfCurrentFuelSurchargeAgreement =
            fuelSurchargeService.isOwnerOfPricingFuelSurchargeAgreement(value, connectedCompany);

        const canEdit = invoicingRightService.canEditAgreedPrice(
            transport,
            connectedCompany?.pk,
            hasShipperFinalPriceEnabled
        );
        const initialValueRef = useRef(getInitialPricingForm(value, connectedCompany));
        const matchingTariffGrids = useMatchingTariffGridsFromTransportUid(
            transport?.uid,
            "QUOTATION"
        );
        const matchingFuelSurchargeAgreement = useMatchingFuelSurchargeAgreementFromTransportUid(
            transport?.uid,
            "quotation"
        );
        const hasPurchaseTariffGridsEnabled = useFeatureFlag("purchaseTariffGrids");

        const isShipperOfTransport = transportViewerService.isShipperOf(
            transport,
            connectedCompany?.pk
        );

        const canAddTariffGrids = isShipperOfTransport && hasPurchaseTariffGridsEnabled;

        const invoiceItemSuggestionArguments: InvoiceItemSuggestionArguments = {
            customerToInvoiceId: transport?.customer_to_invoice?.pk,
            shipperId: transport?.shipper.pk,
        };

        return (
            <Box
                pt={3}
                borderLeft="1px solid"
                borderRight="1px solid"
                borderBottom="1px solid"
                borderColor="grey.light"
            >
                <PricingForm
                    isCarrierOfTransport={isCarrierOfTransport}
                    isOwnerOfCurrentFuelSurchargeAgreement={isOwnerOfCurrentFuelSurchargeAgreement}
                    initialPricing={initialValueRef.current}
                    initialRealQuantities={value?.real_quantities}
                    initialPlannedQuantities={value?.planned_quantities}
                    onSubmit={onSubmit}
                    displayTariffGrids={canAddTariffGrids}
                    readOnly={!canEdit}
                    matchingTariffGridInfos={matchingTariffGrids}
                    matchingFuelSurchargeAgreement={matchingFuelSurchargeAgreement}
                    invoiceItemSuggestionArguments={invoiceItemSuggestionArguments}
                    onCopyToFinalPrice={onCopyToFinalPrice}
                    ref={ref}
                />
            </Box>
        );
    }
);
AgreedPriceForm.displayName = "AgreedPriceForm";
