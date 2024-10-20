import {getConnectedCompany, useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, EditableField} from "@dashdoc/web-ui";
import {Pricing} from "dashdoc-utils";
import React from "react";

import {useCompaniesInConnectedGroupView} from "app/hooks/useCompaniesInConnectedGroupView";
import {useSelector} from "app/redux/hooks";
import {invoicingRightService} from "app/services/invoicing";

import {TransportPriceDetails} from "./TransportPriceDetails";

import type {Transport} from "app/types/transport";

export type Props = {
    transport: Transport;
    pricing: Pricing | null;
    onClickOnPrice: () => void;
};

export function EffectivePrice({transport, pricing, onClickOnPrice}: Props) {
    const connectedCompany = useSelector(getConnectedCompany);
    const companiesFromConnectedGroupView = useCompaniesInConnectedGroupView();
    const hasCarrierAndShipperPriceEnabled = useFeatureFlag("carrierAndShipperPrice");
    const hasShipperFinalPriceEnabled = useFeatureFlag("shipperFinalPrice");

    const canEditAgreedPrice = invoicingRightService.canEditAgreedPrice(
        transport,
        connectedCompany?.pk,
        hasShipperFinalPriceEnabled
    );
    const canEditInvoicedPrice = invoicingRightService.canEditInvoicedPrice(
        transport,
        connectedCompany?.pk,
        hasCarrierAndShipperPriceEnabled,
        companiesFromConnectedGroupView
    );
    const canEditShipperFinalPrice = invoicingRightService.canEditShipperFinalPrice(
        transport,
        connectedCompany?.pk,
        hasShipperFinalPriceEnabled
    );
    const updateButtonLabel =
        canEditAgreedPrice || canEditInvoicedPrice || canEditShipperFinalPrice
            ? t("common.edit")
            : t("common.view");

    return (
        <Box pt={3}>
            <EditableField
                clickable={true}
                label={null}
                updateButtonLabel={updateButtonLabel}
                value={
                    <TransportPriceDetails
                        pricing={pricing}
                        pricingMismatchAmount={transport.prices?.mismatch_amount}
                    />
                }
                onClick={onClickOnPrice}
                data-testid={"update-price-button"}
            />
        </Box>
    );
}
