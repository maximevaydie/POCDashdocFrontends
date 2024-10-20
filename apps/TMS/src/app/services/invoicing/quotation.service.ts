/**
 * Methods which can apply to pricing of type "agreed price / quotation"
 */

import {t} from "@dashdoc/web-core";
import {formatNumber, Pricing, TransportOfferPricing} from "dashdoc-utils";

function getQuotationDetails(quotation: Pricing, defaultCurrency: string) {
    if (quotation && quotation?.lines.length > 0) {
        const quotationLines = getQuotationLines(quotation, defaultCurrency);
        const finalPrice = getFinalPrice(quotation, defaultCurrency);

        return {
            rows: quotationLines,
            value: finalPrice,
        };
    }

    return null;
}

function getQuotationLines(quotation: Pricing | TransportOfferPricing, defaultCurrency: string) {
    const lines = quotation?.lines?.map((l) => {
        return {
            label: l.description,
            subValue: `${formatNumber(l.final_quantity)} x ${formatNumber(l.unit_price, {
                style: "currency",
                currency: l.currency ?? defaultCurrency,
                maximumFractionDigits: 3,
            })}`,
        };
    });

    const finalPriceWithGasIndex =
        "final_price_with_gas_indexed" in quotation
            ? quotation?.final_price_with_gas_indexed
            : undefined;
    const finalPriceWithoutGasIndex = quotation?.final_price_without_gas_indexed;

    if (finalPriceWithGasIndex && finalPriceWithoutGasIndex) {
        const totalFuelSurcharge =
            Number(finalPriceWithGasIndex) - Number(finalPriceWithoutGasIndex);
        const fuelSurchargeLine = getFuelSurchargeLine(totalFuelSurcharge, defaultCurrency);
        if (fuelSurchargeLine) {
            lines.push(fuelSurchargeLine);
        }
    }

    return lines;
}

function getFuelSurchargeLine(fuelSurcharge: number, defaultCurrency: string) {
    // check for equality (not greater than) because there can be negative fuel surcharges
    if (!isNaN(fuelSurcharge) && fuelSurcharge !== 0) {
        return {
            label: t("components.gasIndex"),
            subValue: `${formatNumber(fuelSurcharge, {
                style: "currency",
                currency: defaultCurrency,
            })}`,
        };
    }

    return undefined;
}

function getFinalPrice(quotation: Pricing | TransportOfferPricing, defaultCurrency: string) {
    const finalPrice =
        "final_price_with_gas_indexed" in quotation
            ? (quotation?.final_price_with_gas_indexed ??
              quotation?.final_price_without_gas_indexed)
            : quotation?.final_price_without_gas_indexed;

    return formatNumber(finalPrice, {
        minimumFractionDigits: 2,
        style: "currency",
        // the total currency symbol is deducted from the first line currency
        currency: quotation.lines[0]?.currency || defaultCurrency,
    });
}

export const quotationService = {
    getQuotationDetails,
    getQuotationLines,
    getFinalPrice,
};
