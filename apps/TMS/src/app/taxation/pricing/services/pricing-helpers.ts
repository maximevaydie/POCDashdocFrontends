import {Pricing} from "dashdoc-utils";

/** Tells whether a pricing has a manually set fuel surcharge */
export const hasOverridenFuelSurcharge = (pricing: Pricing): boolean => {
    return parseFloat(pricing.overridden_gas_index) !== 0;
};

/**Tells whether a pricing is missing some invoice item. */
export const isPricingMissingItem = (pricing: Pricing): boolean => {
    const someLinesAreMissingInvoiceItem = pricing.lines.some(
        (line) => line.invoice_item === null
    );
    const tariffGridLineIsMissingInvoiceItem =
        pricing.tariff_grid_line !== null && pricing.tariff_grid_line?.invoice_item === null;

    const manuallySetFuelSurchargeIsMissingInvoiceItem =
        hasOverridenFuelSurcharge(pricing) && pricing.gas_index_invoice_item === null;

    return (
        someLinesAreMissingInvoiceItem ||
        tariffGridLineIsMissingInvoiceItem ||
        manuallySetFuelSurchargeIsMissingInvoiceItem
    );
};

/**Tells whether a pricing is missing some invoice item. */
export const isPricingsFuelSurchargeAgreementMissingItem = (
    pricing: Pricing
): pricing is Pricing & {
    fuel_surcharge_agreement: Exclude<Pricing["fuel_surcharge_agreement"], null>;
} => {
    return (
        !pricing.dismissed_automatic_fuel_surcharge_application &&
        !hasOverridenFuelSurcharge(pricing) &&
        pricing.fuel_surcharge_agreement !== null &&
        pricing.fuel_surcharge_agreement?.invoice_item === null
    );
};
