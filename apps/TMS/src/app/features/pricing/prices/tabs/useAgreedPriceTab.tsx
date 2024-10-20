import {useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Text} from "@dashdoc/web-ui";
import {Company, Pricing, formatNumber} from "dashdoc-utils";
import React, {useRef} from "react";

import {useCompaniesInConnectedGroupView} from "app/hooks/useCompaniesInConnectedGroupView";
import {PricingFormData, getPricingCurrency, invoicingRightService} from "app/services/invoicing";
import {transportViewerService} from "app/services/transport/transportViewer.service";

import {AgreedPriceForm} from "../forms/AgreedPriceForm";

import {PriceLabel} from "./PriceLabel";
import {PricingTab} from "./types";

import type {Transport} from "app/types/transport";

export const AGREED_PRICE_TAB = "agreed-price";

type Props = {
    transport: Transport;
    connectedCompany: Company | null;
    agreedPrice: Pricing | null;
    invoicedPrice: Pricing | null;
    useLargeLabels: boolean;
    onSubmit: (pricing: PricingFormData) => void;
    onCopyToFinalPrice?: () => void;
};
export function useAgreedPriceTab({
    transport,
    connectedCompany,
    agreedPrice,
    invoicedPrice,
    useLargeLabels,
    onSubmit,
    onCopyToFinalPrice,
}: Props): PricingTab | null {
    const ref = useRef<{
        isDirty: boolean;
    }>(null);
    const hasShipperFinalPriceEnabled = useFeatureFlag("shipperFinalPrice");
    const companiesFromConnectedGroupView = useCompaniesInConnectedGroupView();
    const canRead = invoicingRightService.canReadPrices(
        transport,
        companiesFromConnectedGroupView
    );
    if (!canRead) {
        return null;
    }
    const currency = getPricingCurrency(agreedPrice);

    const isCarrier = transportViewerService.isCarrierOf(transport, connectedCompany?.pk);
    const isShipper = transportViewerService.isShipperOf(transport, connectedCompany?.pk);
    if (hasShipperFinalPriceEnabled && isCarrier && !isShipper && invoicedPrice) {
        // Only one price is needed for carrier and there is an invoiced price,
        // so hide the agreed price tab and show the invoiced price tab instead, see `useInvoicedPriceTab`.
        return null;
    }

    const readOnly = !invoicingRightService.canEditAgreedPrice(
        transport,
        connectedCompany?.pk,
        hasShipperFinalPriceEnabled
    );

    const tooltip = (
        <Box color="grey.dark">
            <Text variant="h1" mb={4}>
                {t("transportColumns.agreedUponPrice")}
            </Text>
            <Text>{t("transportColumns.agreedUponPrice.help")}</Text>
        </Box>
    );
    const label = useLargeLabels ? (
        <PriceLabel
            label={t("transportColumns.agreedUponPrice")}
            price={formatNumber(agreedPrice?.final_price_with_gas_indexed ?? "—", {
                style: "currency",
                currency,
            })}
            tooltip={tooltip}
        />
    ) : (
        t("transportColumns.agreedUponPrice")
    );
    const content = (
        <AgreedPriceForm
            connectedCompany={connectedCompany}
            transport={transport}
            value={agreedPrice}
            ref={ref}
            hasShipperFinalPriceEnabled={hasShipperFinalPriceEnabled}
            onSubmit={onSubmit}
            onCopyToFinalPrice={onCopyToFinalPrice}
            key={AGREED_PRICE_TAB}
        />
    );

    return {
        tab: AGREED_PRICE_TAB,
        label,
        content,
        testId: "prices-modal-agreed-price-tab",
        readOnly,
        pricing: agreedPrice,
        ref,
    };
}
