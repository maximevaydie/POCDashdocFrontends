import {PricingPost} from "dashdoc-utils";

export type RequestReceiver = {
    carrier_id: number;
    contact_uid: string;
};

/**
 * @guidedtour[epic=rfq] Add a Quotation request
 * The interface to store the add payload.
 */
export interface QuotationRequestPost {
    transport_uid: string;
    comment: string;
    carrier_quotations: RequestReceiver[];
    asked_pricing?: PricingPost;
}
