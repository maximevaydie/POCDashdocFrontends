import {useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Text} from "@dashdoc/web-ui";
import {Company, Pricing, formatNumber} from "dashdoc-utils";
import React, {useRef} from "react";

import {useCompaniesInConnectedGroupView} from "app/hooks/useCompaniesInConnectedGroupView";
import {PricingFormData, getPricingCurrency, invoicingRightService} from "app/services/invoicing";
import {transportViewerService} from "app/services/transport/transportViewer.service";

import {InvoicedPriceForm} from "../forms/InvoicedPriceForm";

import {PriceLabel} from "./PriceLabel";
import {PricingTab} from "./types";

import type {Transport} from "app/types/transport";

const INVOICED_PRICE_TAB = "invoiced-price";

type Props = {
    transport: Transport;
    connectedCompany: Company | null;
    invoicedPrice: Pricing | null;
    useLargeLabels: boolean;
    onSubmit: (pricing: PricingFormData) => void;
    onCopyToFinalPrice?: () => void;
};
export function useInvoicedPriceTab({
    transport,
    connectedCompany,
    invoicedPrice,
    useLargeLabels,
    onSubmit,
    onCopyToFinalPrice,
}: Props): PricingTab | null {
    const ref = useRef<{
        isDirty: boolean;
    }>(null);
    const hasCarrierAndShipperPriceEnabled = useFeatureFlag("carrierAndShipperPrice");
    const hasShipperFinalPriceEnabled = useFeatureFlag("shipperFinalPrice");
    const companiesFromConnectedGroupView = useCompaniesInConnectedGroupView();
    const isCarrier = transportViewerService.isCarrierOf(transport, connectedCompany?.pk);
    const isShipper = transportViewerService.isShipperOf(transport, connectedCompany?.pk);
    if (hasShipperFinalPriceEnabled && isCarrier && !isShipper && !invoicedPrice) {
        // Only one price is needed for carrier and there is no invoiced price,
        // so hide the invoiced price tab and show the agreed price tab instead, see `useAgreedPriceTab`.
        return null;
    }
    const canRead = invoicingRightService.canReadInvoicedPrice(
        transport,
        connectedCompany?.pk,
        hasCarrierAndShipperPriceEnabled,
        companiesFromConnectedGroupView
    );
    if (!canRead) {
        return null;
    }

    const currency = getPricingCurrency(invoicedPrice);

    const readOnly = !invoicingRightService.canEditInvoicedPrice(
        transport,
        connectedCompany?.pk,
        hasCarrierAndShipperPriceEnabled,
        companiesFromConnectedGroupView
    );

    const tooltip = (
        <Box color="grey.dark">
            <Text variant="h1" mb={4}>
                {t("transportColumns.invoicedPrice")}
            </Text>
            <Text>{t("transportColumns.invoicedPrice.help")}</Text>
        </Box>
    );

    const label = useLargeLabels ? (
        <PriceLabel
            label={t("transportColumns.invoicedPrice")}
            price={formatNumber(invoicedPrice?.final_price_with_gas_indexed ?? "—", {
                style: "currency",
                currency,
            })}
            tooltip={tooltip}
            variant={transport.prices?.mismatch ? "error" : "default"}
        />
    ) : (
        t("transportColumns.invoicedPrice")
    );
    const content = (
        <InvoicedPriceForm
            connectedCompany={connectedCompany}
            transport={transport}
            value={invoicedPrice}
            hasCarrierAndShipperPriceEnabled={hasCarrierAndShipperPriceEnabled}
            ref={ref}
            onSubmit={onSubmit}
            onCopyToFinalPrice={onCopyToFinalPrice}
            key="invoiced-price"
        />
    );

    return {
        tab: INVOICED_PRICE_TAB,
        label,
        content,
        testId: "prices-modal-invoiced-price-tab",
        readOnly,
        pricing: invoicedPrice,
        ref,
    };
}
