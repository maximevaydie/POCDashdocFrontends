import {Address, Company, Settings} from "dashdoc-utils";

export const primaryAddress: Address = {
    pk: 11,
    name: "Address 1",
    address: "Route des Galops",
    company: {pk: 0},
    city: "Paron",
    postcode: "89100",
    country: "FR",
    latitude: null,
    longitude: null,
    radius: null,
    coords_validated: true,
    flow_site: null,
};

export const address1: Address = {
    pk: 1,
    name: "Address 1",
    address: "Route des Galops",
    company: {pk: 0},
    city: "Paron",
    postcode: "89100",
    country: "FR",
    latitude: null,
    longitude: null,
    radius: null,
    coords_validated: true,
    flow_site: null,
};

export const address2: Address = {
    pk: 2,
    name: "Address 2",
    address: "allée de la rance",
    company: {pk: 0},
    city: "Orvault",
    postcode: "44700",
    country: "FR",
    latitude: null,
    longitude: null,
    radius: null,
    coords_validated: true,
    flow_site: null,
};

export const addressUnknown: Address = {
    pk: 3,
    name: "Address 3",
    address: "La belle adresse",
    // @ts-ignore
    company: null,
    city: "Nantes",
    postcode: "44300",
    country: "FR",
    latitude: null,
    longitude: null,
    radius: null,
    coords_validated: true,
    flow_site: null,
};

export const aCompany: Company = {
    pk: 0,
    name: "UUU",
    siren: "",
    country: "FR",
    account_type: "subscribed",
    primary_address: primaryAddress,
    addresses: [address1, address2],
    notes: "",
};

export const aSetting: Settings = {
    stamp: null,
    logo: null,
    block_shipper_creation: true,
    qualimat_certificate_number: "",
    idtf_certification: "",
    certification_name: "",
    carrier_inferred_from_trucker: false,
    mobile_app_assignment: "trucker",
    constrain_reference_edition: false,
    ignore_creator_constraint_in_signature_process: false,
    default_currency: "EUR",
    optimization_settings: {default_vehicle_capacity_in_lm: 13.6},
    rental_linked_deliveries_selected_by_default: false,
    invoice_payment: true,
};
