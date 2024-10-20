import {SimpleContact, SlimCompany, Pricing} from "dashdoc-utils";

export type QuotationStatus = "PENDING" | "REJECTED" | "REPLIED" | "ACCEPTED";

/**
 * @guidedtour[epic=rfq] Quotation
 * `uid` is an unique value to create the quotation screen url.
 *
 * `/app/quotations/${uid}`
 *
 * This url will provide a DD account free context to submit a quotation.
 *
 * The carrier will:
 * * receive this url in an email;
 * * click on the url;
 * * submit a quotation or a rejection.
 */
export interface Quotation {
    pk: number;
    uid: string;
    replied_date: string | null;
    carrier: SlimCompany;
    contact: SimpleContact;
    status: QuotationStatus;
    comment: string;
    pricing: Pricing | null;
    expected_delivery_date: string | null;
}

/**
 * @guidedtour[epic=rfq] Quotation request
 * The entity to store a set of carrier quotation.
 */
export interface QuotationRequest {
    pk: number;
    created: string;
    deleted: string | null;
    expiration_date: string | null;
    comment: string;
    carrier_quotations: Quotation[];
    pricing: Pricing | null;
}

/**
 * This interface should be probably merged with SlimUser in a refactoring.
 */
export interface Author {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
}
