import {ManagerCompany} from "@dashdoc/web-common";

import {Site} from "./site";

export type CompanyAddress = {
    address: string;
    city: string;
    postcode: string;
    country: string;
};

export type Company = {
    pk: number;
    name: string;
};

type Delegate = {
    id: number;
    name: string;
};

type FlowSite = {
    id: number;
    timezone: string;
    slug: string;
    address: {
        pk: number;
        address: string;
        city: string;
        country: string;
        postcode: string;
        latitude: number;
        longitude: number;
    };
};

export type FlowDelegation = {
    id: number;
    site: Site; // the site of the delegation
    first_delegate: Delegate; // the direct partner for the site
    via: null | Delegate; // the parent in case of sub-delegation (null otherwise)
};

export type FlowManagerCompany = ManagerCompany & {
    flow_site: FlowSite | null;
    flow_delegations: FlowDelegation[];
};
