import {t} from "@dashdoc/web-core";
import {CompanyWithGroupView, Pricing} from "dashdoc-utils";

import {
    getInitialPricingForm,
    type PricingFormData,
    type PricingFormLine,
} from "app/services/invoicing/pricing.service";

function getPricingForm(
    pricingData: Pricing | null,
    company: CompanyWithGroupView | undefined
): PricingFormData {
    const initialPricing = getInitialPricingForm(pricingData, company);
    if (pricingData === null) {
        const defaultLine: PricingFormLine = {
            description: t("pricingMetrics.flat"),
            invoice_item: null,
            metric: "FLAT",
            quantity: "1.000",
            unit_price: "0.000",
            is_gas_indexed: true,
            isOverridden: true,
            currency: "EUR",
        };
        initialPricing.lines.push(defaultLine);
    } else {
        if (initialPricing.lines.length > 0) {
            initialPricing.lines[0].is_gas_indexed = true;
        }
    }

    return initialPricing;
}

export const quotationService = {
    getPricingForm,
};
