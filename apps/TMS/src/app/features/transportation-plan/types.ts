import {TransportOfferPricing, PricingPost} from "dashdoc-utils";

export interface PricingDetails {
    rows: {label: string; subValue: string}[];
    value: string;
}

export interface CarrierCard {
    id: number;
    title: string;
    subTitle: React.ReactNode;
    carrierPk: number;
    logo?: string;
}

export interface CarrierOffer extends CarrierCard, PricingDetails {
    pricing: TransportOfferPricing;
}

export type CarrierApprovalStatus =
    | "ordered"
    | "requested"
    | "accepted"
    | "declined"
    | "cancelled"
    | "other";

export const DEFAULT_CURRENCY = "EUR";

export type SubcontractSubmit = {
    carrier: {pk: number};
    carrier_contacts: string[];
    send_to_carrier: boolean;
    instructions: string;
    quotation?: PricingPost;
    price?: number;
    analytics?: {[key: string]: string | boolean};
    requested_vehicle_uid?: string | null;
};
