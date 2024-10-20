import {PricingPost} from "dashdoc-utils";

import type {PricingFormData} from "app/services/invoicing/pricing.service";

/**
 * @guidedtour[epic=rfq] Reply to the quotation request
 * The interface to store the replied quotation.
 */
export interface QuotationReplyPost {
    expected_delivery_date: string;
    comment: string;
    pricing: PricingPost;
}

/**
 * @guidedtour[epic=rfq] reject to the quotation request
 * The interface to store the rejected quotation.
 */
export interface QuotationRejectPost {
    comment: string;
}

export type QuotationFormData = {
    quotation: PricingFormData;
    comment: string;
    expected_delivery_date: Date | null;
};
