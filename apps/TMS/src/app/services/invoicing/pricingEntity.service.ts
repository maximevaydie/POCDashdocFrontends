/**
 * Methods which can apply to all pricing types (quotation, pricing, shipper final price, etc)
 */

import {Pricing} from "dashdoc-utils";

/** Get the total price of the lines where fuel surcharge should apply */
// export function getFuelSurchargeApplicableTotalPrice(pricing: Pricing | null): number {
export function getFuelSurchargeApplicableTotalPrice(pricing: Pricing | null): number {
    if (!pricing) {
        return 0;
    }

    const linesTotalPrice = pricing.lines
        .filter((line) => line.is_gas_indexed)
        .reduce((totalPrice: number, line) => {
            return totalPrice + (parseFloat(line.final_price) || 0);
        }, 0);

    const tariffGridLineTotalPrice = pricing.tariff_grid_line?.is_gas_indexed
        ? parseFloat(pricing.tariff_grid_line.final_price || "") || 0
        : 0;

    return Number((linesTotalPrice + tariffGridLineTotalPrice).toFixed(2));
}

export function isPricingEmpty(pricing: Pricing): boolean {
    return (
        pricing.lines.length === 0 &&
        pricing.tariff_grid_line === null &&
        pricing.overridden_gas_index === "0.00"
    );
}
