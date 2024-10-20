import {useFeatureFlag} from "@dashdoc/web-common/src/hooks/useFeatureFlag";
import {Box} from "@dashdoc/web-ui";
import {Company, Pricing} from "dashdoc-utils";
import React, {forwardRef, useRef} from "react";

import {fuelSurchargeService} from "app/features/pricing/fuel-surcharges/services/fuelSurcharge.service";
import {InvoiceItemSuggestionArguments} from "app/features/pricing/invoices/invoice-item/invoice-item-suggestion";
import {useMatchingTariffGridsFromTransportUid} from "app/hooks/useMatchingTariffGrids";
import {
    PricingFormData,
    getInitialPricingForm,
    invoicingRightService,
} from "app/services/invoicing";
import {transportViewerService} from "app/services/transport";

import {PricingForm} from "../../pricing-form/PricingForm";

import type {Transport} from "app/types/transport";

type Props = {
    connectedCompany: Company | null;
    transport: Transport;
    value: Pricing | null | undefined;
    hasShipperFinalPriceEnabled: boolean;
    onSubmit: (pricing: PricingFormData) => void;
    onCopyFromInvoicedPrice?: () => void;
};

export const ShipperFinalPriceForm = forwardRef(
    (
        {
            connectedCompany,
            transport,
            value,
            hasShipperFinalPriceEnabled,
            onSubmit,
            onCopyFromInvoicedPrice,
        }: Props,
        ref
    ) => {
        const hasPurchaseTariffGridsEnabled = useFeatureFlag("purchaseTariffGrids");
        const isOwnerOfCurrentFuelSurchargeAgreement =
            fuelSurchargeService.isOwnerOfPricingFuelSurchargeAgreement(value, connectedCompany);

        const invoiceItemSuggestionArguments: InvoiceItemSuggestionArguments = {
            customerToInvoiceId: transport?.customer_to_invoice?.pk,
            shipperId: transport?.shipper.pk,
        };

        const canEditPricing = invoicingRightService.canEditShipperFinalPrice(
            transport,
            connectedCompany?.pk,
            hasShipperFinalPriceEnabled
        );

        const isShipperOfTransport = transportViewerService.isShipperOf(
            transport,
            connectedCompany?.pk
        );

        const canAddTariffGrids = isShipperOfTransport && hasPurchaseTariffGridsEnabled;

        const matchingTariffGrids = useMatchingTariffGridsFromTransportUid(
            transport?.uid,
            "SHIPPER_FINAL_PRICE"
        );

        const initialPricingRef = useRef(getInitialPricingForm(value, connectedCompany));

        return (
            <Box
                pt={3}
                borderLeft="1px solid"
                borderRight="1px solid"
                borderBottom="1px solid"
                borderColor="grey.light"
            >
                <PricingForm
                    isCarrierOfTransport={false}
                    isOwnerOfCurrentFuelSurchargeAgreement={isOwnerOfCurrentFuelSurchargeAgreement}
                    initialPricing={initialPricingRef.current}
                    pricingType="shipperFinalPrice"
                    initialRealQuantities={value?.real_quantities}
                    initialPlannedQuantities={value?.planned_quantities}
                    onSubmit={onSubmit}
                    readOnly={!canEditPricing}
                    displayTariffGrids={canAddTariffGrids}
                    matchingTariffGridInfos={matchingTariffGrids}
                    matchingFuelSurchargeAgreement={null}
                    invoiceItemSuggestionArguments={invoiceItemSuggestionArguments}
                    onCopyFromInvoicedPrice={onCopyFromInvoicedPrice}
                    ref={ref}
                />
            </Box>
        );
    }
);
ShipperFinalPriceForm.displayName = "ShipperFinalPriceForm";
