import {Pricing} from "dashdoc-utils";
import {useMemo} from "react";

import {DEFAULT_CURRENCY, type PricingDetails} from "app/features/transportation-plan/types";
import {quotationService} from "app/services/invoicing/quotation.service";

/**
 * Return a pricingDetails according to the given transportQuotation.
 */
export function usePricingDetails(transportQuotation: Pricing | null) {
    const pricingDetails = useMemo(() => {
        let result: PricingDetails | null = null;
        if (transportQuotation) {
            result = quotationService.getQuotationDetails(transportQuotation, DEFAULT_CURRENCY);
        }
        return result;
    }, [transportQuotation]);
    return pricingDetails;
}
