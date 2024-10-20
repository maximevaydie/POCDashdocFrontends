import {getConnectedCompany, useFeatureFlag} from "@dashdoc/web-common";
import {Pricing} from "dashdoc-utils";
import React from "react";

import {useCompaniesInConnectedGroupView} from "app/hooks/useCompaniesInConnectedGroupView";
import {useSelector} from "app/redux/hooks";
import {pricingService} from "app/services/invoicing";

import {CostAndMargin} from "./components/CostAndMargin";
import {EffectivePrice} from "./components/EffectivePrice";

import type {Transport} from "app/types/transport";

export type InvoiceInfoForTransport = {
    uid: string;
    document_number: string | null;
};

export type Props = {
    transport: Transport;
    agreedPrice: Pricing | null;
    invoicedPrice: Pricing | null;
    shipperFinalPrice: Pricing | null;
    onClickOnPrice: () => void;
};

export function TransportPrice(props: Props) {
    const connectedCompany = useSelector(getConnectedCompany);
    const {transport, agreedPrice, invoicedPrice, shipperFinalPrice, onClickOnPrice} = props;

    const companiesFromConnectedGroupView = useCompaniesInConnectedGroupView();
    const hasCarrierAndShipperPriceEnabled = useFeatureFlag("carrierAndShipperPrice");
    const hasShipperFinalPriceEnabled = useFeatureFlag("shipperFinalPrice");

    const pricing = pricingService.getTransportPricing({
        transport,
        companyPk: connectedCompany?.pk,
        agreedPrice,
        invoicedPrice,
        shipperFinalPrice,
        hasCarrierAndShipperPriceEnabled,
        hasShipperFinalPriceEnabled,
        companiesFromConnectedGroupView,
    });

    return (
        <>
            <EffectivePrice
                transport={transport}
                pricing={pricing}
                onClickOnPrice={onClickOnPrice}
            />
            <CostAndMargin transport={transport} />
        </>
    );
}
