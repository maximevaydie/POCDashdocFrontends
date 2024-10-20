import {
    getPricingPostData,
    TransportOffer,
    purgePricingIds,
    purgeVariableQuantity,
} from "dashdoc-utils";

import {quotationService} from "app/services/invoicing/quotation.service";

import {CarrierOffer} from "../types";

import type {Transport} from "app/types/transport";

function getCarrierOffers(offers: TransportOffer[], defaultCurrency: string): CarrierOffer[] {
    function getSubTitle(offer: TransportOffer) {
        return `${offer.origin_area?.name} -> ${offer.destination_area?.name} - ${offer.requested_vehicle.label}`;
    }

    return offers.map((o, index) => {
        return {
            id: index,
            title: o.carrier?.name,
            subTitle: getSubTitle(o),
            rows: quotationService.getQuotationLines(o.pricing, defaultCurrency),
            pricing: o.pricing,
            value: quotationService.getFinalPrice(o.pricing, defaultCurrency),
            carrierPk: o.carrier.pk,
        };
    });
}

function isValidForOffers(transport: Transport): boolean {
    let result = false;
    const deliveriesLength = transport?.deliveries ? transport.deliveries.length : 0;
    const firstDelivery = transport?.deliveries?.[0];
    // ATM transport offers feature needs an A-B transport, an origin and a destination addresses, else you'll have no results
    if (
        deliveriesLength === 1 &&
        firstDelivery.origin?.address &&
        firstDelivery.destination?.address
    ) {
        result = true;
    }
    return result;
}

function createQuotationFromPricing(offers: TransportOffer) {
    const {pricing} = offers;
    const pricingWithoutIds = purgePricingIds(pricing);
    const pricingPost = getPricingPostData(pricingWithoutIds);
    const result = purgeVariableQuantity(pricingPost);
    return result;
}

export const offerService = {
    getCarrierOffers,
    isValidForOffers,
    createQuotationFromPricing,
};
