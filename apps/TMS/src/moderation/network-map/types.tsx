import {SelectOption} from "@dashdoc/web-ui";
import Leaflet from "leaflet";

export type NetworkMapPosition = {
    latlng: Leaflet.LatLng;
    company: DirectoryCompanySimple;
    key: number;
};

export type DirectoryCompanySimple = Pick<
    DirectoryCompany,
    | "id"
    | "denomination"
    | "country"
    | "is_headquarters"
    | "latitude"
    | "longitude"
    | "dashdoc_account_type"
    | "light_vehicle_count"
    | "official_vehicle_count"
    | "truckers_count"
    | "heavy_vehicle_count"
    | "has_active_managers"
    | "has_loggable_managers"
>;

type DashdocCompany = {
    id: string;
    name: string;
    account_type: string;
    has_loggable_managers: boolean;
    created_by: {
        id: string;
        name: string;
        account_type: string;
    };
};
export interface DirectoryCompany {
    id: number;
    updated: string;
    created: string;
    deleted: string;
    company_identification_number: string;
    trade_number: string;
    vat_number: string;
    is_headquarters: boolean;
    parent_company: number;
    crm_id: string;
    crm_owner_id: string;
    crm_owner_name: string;
    denomination: string;
    country: string;
    department: string;
    department_code: string;
    city: string;
    postcode: string;
    address: string;
    latitude: number;
    longitude: number;
    phone: string;
    email: string;
    website: string;
    employee_count: number;
    truckers_count: number;
    official_vehicle_count: number;
    heavy_vehicle_count: number;
    light_vehicle_count: number;
    company_type: string[];
    business_sector: string[];
    tms: string[];
    invoicing_tool: string[];
    telematics_provider: string[];
    truck_types: string[];
    lead_status: string;
    nace_code: string;
    is_active: boolean;
    dashdoc_account_type: string;
    has_loggable_managers: boolean;
    has_active_managers: boolean;
    dashdoc_created_time: string;
    manager_last_login: string;
    dashdoc_companies: DashdocCompany[];
}

export type FilterState = {
    name: string;
    value: SelectOption<string> | string | number | boolean;
    setter: (value: SelectOption<string> | string | number | boolean) => void;
};

export type FiltersState = {[name: string]: FilterState[]};
