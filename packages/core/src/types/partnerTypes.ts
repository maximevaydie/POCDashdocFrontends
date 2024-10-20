import type {Named} from "@dashdoc/web-ui";

import type {SimpleAddress} from "./address";

export type AdministrativeAddressCreateInput = {
    address: string;
    city: string;
    postcode: string;
    country: string;
    latitude?: number;
    longitude?: number;
};

export type PartnerCreateInput = {
    /**
     * The `remote_id` notion is from the dashdoc point of view.
     * For the end user/in the UX, we will talk about internal_id.
     * Indeed this id refers to an id from the partner system (not managed by dashdoc itself).
     */
    remote_id: string;
    invoicing_remote_id?: string;
    name: string;
    trade_number: string;
    vat_number: string;
    administrative_address: AdministrativeAddressCreateInput;
    account_code?: string;
    side_account_code?: string;
    notes: string;
    is_carrier: boolean;
    is_shipper: boolean;
    is_invoiceable: boolean;
    is_also_a_logistic_point: boolean;
};

export type AdministrativeAddressUpdateInput = {
    address?: string;
    city?: string;
    postcode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
};

export type PartnerUpdateInput = {
    /**
     * The `remote_id` notion is from the dashdoc point of view.
     * For the end user/in the UX, we will talk about internal_id.
     * Indeed this id refers to an id from the partner system (not managed by dashdoc itself).
     */
    remote_id?: string;
    invoicing_remote_id?: string;
    name?: string;
    trade_number?: string;
    vat_number?: string;
    administrative_address?: AdministrativeAddressUpdateInput;
    account_code?: string;
    side_account_code?: string;
    notes?: string;
    is_carrier?: boolean;
    is_shipper?: boolean;
};

export type NotEditablePartnerUpdateInput = {
    remote_id?: string;
    invoicing_remote_id?: string;
    account_code?: string;
    side_account_code?: string;
    notes?: string;
    is_carrier?: boolean;
    is_shipper?: boolean;
};

export type AdministrativeAddressOutput = {
    pk: number;
    address: string;
    city: string;
    postcode: string;
    country: string;
    latitude: number;
    longitude: number;
};

export type PartnerLogisticPointOutput = {
    pk: number;
    /**
     * The `remote_id` notion is from the dashdoc point of view.
     * For the end user/in the UX, we will talk about internal_id.
     * Indeed this id refers to an id from the partner system (not managed by dashdoc itself).
     */
    remote_id: string;
    name: string;
    address: string;
    city: string;
    postcode: string;
    country: string;
    latitude: number;
    longitude: number;
    radius: number;
    coords_validated: boolean;
    is_demo: boolean;
    is_carrier: boolean;
    is_shipper: boolean;
    is_origin: boolean;
    is_destination: boolean;
    created: string;
    instructions: string;
    theoretical_activity_duration_in_min: number;
    created_by_user: {
        pk: number;
        trucker_id: number | null;
        display_name: string;
        // id of the company the user belongs to
        company: number;
        email: string;
        phone_number: string;
    };
    created_by: {
        pk: number;
        name: string;
    };
};

export type PartnerContactOutput = {
    uid: string;
    first_name: string;
    last_name: string;
    company: {
        pk: number;
        name: string;
    };
    email: string;
    phone_number: string;
    remote_id: string;
    jobs: string[];
    language: string;
    invitation_status: "not_invited" | "invited" | "registered";
    invitation_link: string | null;
};

export type DefaultPartnerValue = Partial<Named> & {
    is_carrier?: true;
    is_shipper?: true;
};

export type PartnerDetailOutput = {
    pk: number;
    created: string;
    /**
     * The `remote_id` notion is from the dashdoc point of view.
     * For the end user/in the UX, we will talk about internal_id.
     * Indeed this id refers to an id from the partner system (not managed by dashdoc itself).
     */
    remote_id: string;
    invoicing_remote_id: string;
    name: string;
    country: string;
    trade_number: string;
    vat_number: string;
    phone_number: string;
    email: string;
    administrative_address: AdministrativeAddressOutput;
    transports_in_last_month: number;
    invitation_status: "not_invited" | "invited" | "registered";
    is_verified: boolean;
    account_code: string;
    side_account_code: string;
    is_carrier: boolean;
    is_shipper: boolean;
    notes: string;
    logistic_points: PartnerLogisticPointOutput[];
    contacts: PartnerContactOutput[];
    can_invite_to: boolean;
    can_edit:
        | {
              value: true;
              cannot_edit_reason: null;
          }
        | {
              value: false;
              cannot_edit_reason:
                  | "invited_companies_cannot_update_companies"
                  | "subscribed_companies_cannot_be_updated_by_other_companies"
                  | "cannot_update_company_managed_by_another_company";
          };
};

export type CarrierInListOutput = {
    pk: number;
    created: string;
    remote_id: string;
    invoicing_remote_id: string;
    name: string;
    trade_number: string;
    vat_number: string;
    administrative_address: SimpleAddress;
    invitation_status: "not_invited" | "invited" | "registered";
    is_verified: boolean;
    account_code: string;
    notes: string;
    can_invite_to: boolean;
    side_account_code: string;
};

export type PartnerInListOutput = {
    pk: number;
    created: string;
    /**
     * The `remote_id` notion is from the dashdoc point of view.
     * For the end user/in the UX, we will talk about internal_id.
     * Indeed this id refers to an id from the partner system (not managed by dashdoc itself).
     */
    remote_id: string;
    invoicing_remote_id: string;
    name: string;
    trade_number: string;
    vat_number: string;
    administrative_address: AdministrativeAddressOutput;
    transports_in_last_month: number;
    invitation_status: "not_invited" | "invited" | "registered";
    is_verified: boolean;
    account_code: string;
    side_account_code: string;
    is_carrier: boolean;
    is_shipper: boolean;
    notes: string;
    created_by: {
        company_name: string | null;
        user_name: string | null;
    };
    can_invite_to: boolean;
};

export type PartnerCategory = "carrier" | "shipper";

export type CarrierInTransport = {
    pk: number;
    name: string;
    administrative_address: SimpleAddress;
    notes: string;
    is_verified: boolean;
    vat_number: string;
    account_code: string;
    invitation_status: string;
    invoicing_remote_id: string;
    remote_id: string;
    side_account_code: string;
    can_invite_to: boolean;
    enforce_qualimat_standard: boolean;
};

export type ShipperInTransport = {
    pk: number;
    name: string;
    administrative_address: SimpleAddress;
    notes: string;
    is_verified: boolean;
    vat_number: string;
    account_code: string;
    invitation_status: string;
    invoicing_remote_id: string;
    remote_id: string;
    side_account_code: string;
    can_invite_to: boolean;
};
