import {SecurityProtocol} from "types/securityProtocol";

export type SiteAddress = {
    pk: number;
    address: string;
    city: string;
    country: string;
    postcode: string;
    latitude: number;
    longitude: number;
};

export type Site = {
    id: number;
    name: string;
    company: number;
    slug: string;
    timezone: string;
    address: SiteAddress;
    contact_email: string | null;
    contact_phone: string | null;
    security_protocol: SecurityProtocol | null;
    use_slot_handled_state: boolean;
};
