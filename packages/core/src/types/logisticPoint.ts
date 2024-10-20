import {CreationMethod} from "dashdoc-utils";

type SecurityProtocol = {
    document_title: string;
    created: string;
    updated: string;
};

export type LogisticPoint = {
    pk: number;
    name: string;
    address: string;
    city: string;
    postcode: string;
    country: string;
    created_by: {
        pk: number;
        name: string;
    };
    created_by_user: {
        pk: number;
        display_name: string;
    };
    creation_method: CreationMethod;
    company: {
        pk: number;
        name: string;
    };
    instructions: string | null;
    security_protocol: SecurityProtocol | null;
    created: string;
    last_used: string | null;
    coords_validated: boolean;
    radius: number | null;
    longitude: number | null;
    latitude: number | null;
};
