import {useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Text} from "@dashdoc/web-ui";
import {Company, Pricing, formatNumber} from "dashdoc-utils";
import React, {useRef} from "react";

import {PricingFormData, getPricingCurrency, invoicingRightService} from "app/services/invoicing";

import {ShipperFinalPriceForm} from "../forms/ShipperFinalPriceForm";

import {PriceLabel} from "./PriceLabel";
import {PricingTab} from "./types";

import type {Transport} from "app/types/transport";

export const SHIPPER_FINAL_PRICE_TAB = "shipper-final-price";

type Props = {
    transport: Transport;
    connectedCompany: Company | null;
    pricing: Pricing | null;
    useLargeLabels: boolean;
    onSubmit: (pricing: PricingFormData) => void;
    onCopyFromInvoicedPrice?: () => void;
};
export function useShipperFinalPriceTab({
    transport,
    connectedCompany,
    pricing,
    useLargeLabels,
    onSubmit,
    onCopyFromInvoicedPrice,
}: Props): PricingTab | null {
    const ref = useRef<{
        isDirty: boolean;
    }>(null);
    const hasShipperFinalPriceEnabled = useFeatureFlag("shipperFinalPrice");
    const canRead = invoicingRightService.canReadShipperFinalPrice(
        transport,
        connectedCompany?.pk,
        hasShipperFinalPriceEnabled
    );
    if (!canRead) {
        return null;
    }

    const currency = getPricingCurrency(pricing);

    const readOnly = !invoicingRightService.canEditShipperFinalPrice(
        transport,
        connectedCompany?.pk,
        hasShipperFinalPriceEnabled
    );

    const tooltip = (
        <Box color="grey.dark">
            <Text variant="h1" mb={4}>
                {t("transportColumns.shipperFinalPrice")}
            </Text>
            <Text>{t("transportColumns.shipperFinalPrice.help")}</Text>
        </Box>
    );
    const label = useLargeLabels ? (
        <PriceLabel
            label={t("transportColumns.shipperFinalPrice")}
            price={formatNumber(pricing?.final_price_with_gas_indexed ?? "—", {
                style: "currency",
                currency,
            })}
            tooltip={tooltip}
            tag={t("transportColumns.shipperFinalPrice.yourPrice")}
            variant="highlight"
        />
    ) : (
        t("transportColumns.shipperFinalPrice")
    );
    const content = (
        <ShipperFinalPriceForm
            connectedCompany={connectedCompany}
            transport={transport}
            value={pricing}
            hasShipperFinalPriceEnabled={hasShipperFinalPriceEnabled}
            ref={ref}
            onSubmit={onSubmit}
            onCopyFromInvoicedPrice={onCopyFromInvoicedPrice}
            key="final"
        />
    );

    return {
        tab: SHIPPER_FINAL_PRICE_TAB,
        label,
        content,
        testId: "prices-modal-shipper-final-price-tab",
        readOnly,
        pricing,
        ref,
    };
}
