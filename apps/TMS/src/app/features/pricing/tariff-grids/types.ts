import {translationKeysZodSchema} from "@dashdoc/web-core";
import {InvoiceItem, PricingMetricKey, TariffGridPricingPolicy} from "dashdoc-utils";
import {z} from "zod";

const AVAILABLE_TARIFF_GRID_COUNTRY_CODES = [
    "at",
    "be",
    "bg",
    "hr",
    "ch",
    "cy",
    "cz",
    "de",
    "dk",
    "ee",
    "es",
    "fi",
    "fr",
    "hu",
    "it",
    "lv",
    "lt",
    "lu",
    "nl",
    "no",
    "pl",
    "pt",
    "ro",
    "sk",
    "si",
    "se",
] as const;

export const availableCountryZodSchema = z.enum(AVAILABLE_TARIFF_GRID_COUNTRY_CODES);
export type TariffGridCountryCode = z.infer<typeof availableCountryZodSchema>;

export const tariffGridCountriesZodSchema = z.record(
    availableCountryZodSchema,
    z.object({
        name: translationKeysZodSchema,
        areas: z.array(z.string()),
    })
);

export type TariffGridCountries = z.infer<typeof tariffGridCountriesZodSchema>;

export type ApplicationDateType =
    | "creation_date"
    | "asked_loading_date"
    | "planned_loading_date"
    | "real_loading_date"
    | "asked_unloading_date"
    | "planned_unloading_date"
    | "real_unloading_date";

// Keep it in sync with TariffGridVersionError in backend
export type TariffGridVersionError =
    | "duplicate_tariff_grid_version_start_date"
    | "missing_application_date_type"
    | "start_date_before_today"
    | "application_date_type_already_defined"
    | "cannot_delete_current_tariff_grid_version"
    | "cannot_delete_past_tariff_grid_version";

export const tariffGridAreasDetailsSchema = z.object({
    name: z.string(),
    zip_code_prefix: z.string(),
    country: availableCountryZodSchema,
});
export type TariffGridAreasDetails = z.infer<typeof tariffGridAreasDetailsSchema>;

export const tariffGridAreasRecordSchema = z.record(tariffGridAreasDetailsSchema);
export type TariffGridAreasRecord = z.infer<typeof tariffGridAreasRecordSchema>;

export type TariffGridZonesLineHeaders = {
    lines_type: "zones";
    zones: TariffGridZone[];
};

export type TariffGridDistancesLineHeaders = {
    lines_type: "distance_range_in_km";
    distances: string[];
};

// TO keep in sync with `TariffGridLineHeadersEntity` in the backend
export type TariffGridLineHeaders = TariffGridZonesLineHeaders | TariffGridDistancesLineHeaders;

export type TariffGridLinesType = TariffGridLineHeaders["lines_type"];

export type TariffGridArea = {
    id: number | null;
    zone_type: "TARIFF_GRID_AREA_ID";
    area: {uid: string; name: string};
};

export type PlaceForTariffGridZone = {
    postcode_prefix: string;
    city: string;
    country: string;
};

type TariffGridPlace = {
    id: number | null;
    zone_type: "PLACE";
    place: PlaceForTariffGridZone;
};

export type TariffGridAddress = {
    id: number | null;
    zone_type: "ADDRESS";
    address: {
        id: number;
        name: string;
        address: string;
        postcode: string;
        city: string;
        country: string;
    };
};

// To keep in sync with TariffGridZoneEntity in backend
export type TariffGridZone = TariffGridArea | TariffGridPlace | TariffGridAddress;

type TariffGridAreaInput = {
    zone_type: "TARIFF_GRID_AREA_ID";
    area_uid: string;
};

type TariffGridPlaceInput = {
    zone_type: "PLACE";
    place: PlaceForTariffGridZone;
};

type TariffGridAddressInput = {
    zone_type: "ADDRESS";
    address_id: number;
};

// To keep in sync with TariffGridZoneInput in backend
export type TariffGridZoneInput =
    | TariffGridAreaInput
    | TariffGridPlaceInput
    | TariffGridAddressInput;

export interface TariffGridVersion<
    LineHeaders extends TariffGridLineHeaders = TariffGridLineHeaders,
> {
    uid: string;
    metric_steps: number[];
    table: number[][];
    start_date: string | null;
    line_headers: LineHeaders;
}

// To keep in sync with the `TariffGridOwnerType` in the backend
export enum TariffGridOwnerType {
    CARRIER = "carrier",
    SHIPPER = "shipper",
}

// To keep in sync with the `TariffGridEntity` output type in the backend
export interface TariffGrid<LineHeaders extends TariffGridLineHeaders = TariffGridLineHeaders> {
    uid: string;
    name: string;
    owner_type: TariffGridOwnerType;
    status: "active" | "inactive";
    load_category: string;
    customers: TariffGridCustomer[];
    is_all_customers: boolean;
    requested_vehicles: TariffGridRequestedVehicle[];
    is_origin_or_destination: "origin" | "destination";
    origin_or_destination: TariffGridZone | null;
    pricing_metric: PricingMetricKey;
    pricing_policy: TariffGridPricingPolicy | null;
    invoice_item: InvoiceItem | null;
    application_date_type: ApplicationDateType | null;
    lines_type: LineHeaders["lines_type"];
    current_version: TariffGridVersion<LineHeaders>;
    past_versions: TariffGridVersion<LineHeaders>[];
    future_versions: TariffGridVersion<LineHeaders>[];
}

export interface TariffGridCustomer {
    pk: number;
    name: string;
}

/** To keep in sync with backend `TariffGridRequestedVehicle` */
export interface TariffGridRequestedVehicle {
    uid: string;
    label: string;
}

export interface MatchingGridLoadInfo {
    category: string;
    weight?: number;
    volume?: number;
    steres?: number;
    linear_meters?: number;
    quantity?: number;
}

export interface MatchingGridAddressInfo {
    id: number | null;
    name: string;
    address: string;
    city: string;
    postcode: string;
    country: string;
}

export interface TransportDatesForTariffGrid {
    creation_date: string | null;
    asked_loading_date: string | null;
    planned_loading_date: string | null;
    real_loading_date: string | null;
    asked_unloading_date: string | null;
    planned_unloading_date: string | null;
    real_unloading_date: string | null;
}

/** The type of arguments expected by the API point that fetched the matching tariff grids associated with transport infos
 * To keep in sync with the backend `TransportForTariffGridsMatching` type */
export interface TransportForTariffGridsMatching {
    pricing_type: "QUOTATION" | "PRICING" | "SHIPPER_FINAL_PRICE";
    origin: MatchingGridAddressInfo;
    destination: MatchingGridAddressInfo;
    customer_to_invoice_pk: number | null;
    shipper_pk: number | null;
    carrier_pk: number | null;
    loaded_loads: MatchingGridLoadInfo[];
    unloaded_loads: MatchingGridLoadInfo[];
    duration_in_minutes: number;
    dates: TransportDatesForTariffGrid;
    distance_in_km: string; // Decimal
    requested_vehicle: TariffGridRequestedVehicle | null;
}

/** Represents the way a tariff grid is applied to a transport.
 * Must be in sync with the backend `TariffGridApplicationInfo` class. */
export interface TariffGridApplicationInfo {
    tariff_grid_version_uid: string;
    name: string;
    created_by: {pk: number; group_view_id: number | null};
    origin_or_destination: TariffGridZone;
    pricing_metric: PricingMetricKey;
    pricing_policy: TariffGridPricingPolicy;
    load_category: string;
    unit_price: string; //Decimal
    quantity_in_metric: string; //Decimal
    invoice_item?: InvoiceItem;
    owner_type: TariffGridOwnerType;
}

// Keep in sync with backend TariffGridPartialUpdateRequest
export interface TariffGridUpdateRequest {
    name?: string;
    status?: "active" | "inactive";
    load_category?: string;
    customers_pks?: number[];
    is_all_customers?: boolean;
    requested_vehicles_uids?: string[];
    is_origin_or_destination?: "origin" | "destination";
    origin_or_destination?: TariffGridZoneInput | null;
    pricing_metric?: string;
    pricing_policy?: string | null;
    invoice_item_uid?: string | null;

    // These fields will update the current version of the tariff grid:
    metric_steps?: number[];
    line_headers?: TariffGridLineHeadersUpsertRequest;
    table?: number[][];
}

// Keep in sync with backend TariffGridVersionCreationRequest
export interface TariffGridVersionCreationRequest {
    tariff_grid_uid: string;
    start_date: string;
    application_date_type?: ApplicationDateType;
    metric_steps: number[];
    table: number[][];
    line_headers: TariffGridLineHeadersUpsertRequest;
}

// Keep in sync with backend TariffGridVersionPartialUpdateRequest
export interface TariffGridVersionUpdateRequest {
    start_date?: string;
    metric_steps?: number[];
    table?: number[][];
    line_headers?: TariffGridLineHeadersUpsertRequest;
}

export type TariffGridLineHeadersUpsertRequest =
    | {
          lines_type: "zones";
          zones: TariffGridZoneInput[];
      }
    | {
          lines_type: "distance_range_in_km";
          distances: Array<string | number>;
      };
