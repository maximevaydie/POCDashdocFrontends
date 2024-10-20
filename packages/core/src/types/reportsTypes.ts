import {HorizontalChart} from "@dashdoc/web-ui";
import {WidgetProps} from "@dashdoc/web-ui";
import {Area} from "dashdoc-utils";

import {TransportsBusinessStatus} from "./businessStatusTypes";

export interface ReportDataPart {
    id: number;
    label: string;
    value: number;
    value_label: string;
}

export interface ReportData {
    id: number;
    type: ReportType;
    name: string;
    tags: string[];
    count: number;
    results: ReportDataPart[];
    subtitle_label: string;
    subtitle_value: string;
}
export interface Report {
    id: number;
    name: string;
    type: ReportType;
    order: number;
    origin_area: Area;
    destination_area: Area;
    parameters?: ReportFiltersData;
    data: ReportData;
}

export interface ReportPost {
    name: string;
    type: string;
}

export interface ReportPatch extends Partial<ReportPost> {
    parameters?: ReportFiltersData;
    origin_area?: Area;
    destination_area?: Area;
    calculation_mode?: ReportCalculationMode;
}

export type ReportCalculationMode = "SUM" | "AVERAGE";

export type PeriodType = "static" | "yesterday" | "last_week" | "last_month";

/** To Keep In  Sync with the backend `ReportPeriodDateType` */
export type ReportPeriodDateType = "LOADING" | "UNLOADING" | "LOADING_AND_UNLOADING";

export interface PeriodFilter {
    period_type: PeriodType;
    date_type?: ReportPeriodDateType;
    date_start?: string;
    date_end?: string;
}

export interface ReportFiltersData {
    period?: PeriodFilter;
    requested_vehicle?: string[];
    shippers?: {pk: number; name: string}[];
    business_statuses?: TransportsBusinessStatus[];
    include_fuel_surcharge?: boolean;
    unchecked_keys?: number[];
}

export enum ReportType {
    TRANSPORT_SUM_PRICING = "TRANSPORT_SUM_PRICING",
    TRANSPORT_AVG_PRICING = "TRANSPORT_AVG_PRICING",
    TRANSPORT_COUNT = "TRANSPORT_COUNT",
    TURNOVER_PER_TRUCKER = "TURNOVER_PER_TRUCKER",
    TURNOVER_PER_VEHICLE = "TURNOVER_PER_VEHICLE",
    TURNOVER_PER_TRAILER = "TURNOVER_PER_TRAILER",
    TURNOVER_PER_TRANSPORT_TAG = "TURNOVER_PER_TRANSPORT_TAG",
    TURNOVER_PER_SHIPPER = "TURNOVER_PER_SHIPPER",
    DISTANCE_PER_TRUCKER = "DISTANCE_PER_TRUCKER",
    DISTANCE_PER_VEHICLE = "DISTANCE_PER_VEHICLE",
    DISTANCE_PER_TRAILER = "DISTANCE_PER_TRAILER",
    DISTANCE_PER_TRANSPORT_TAG = "DISTANCE_PER_TRANSPORT_TAG",
    DISTANCE_PER_SHIPPER = "DISTANCE_PER_SHIPPER",
    TURNOVER_PER_KM_PER_TRUCKER = "TURNOVER_PER_KM_PER_TRUCKER",
    TURNOVER_PER_KM_PER_VEHICLE = "TURNOVER_PER_KM_PER_VEHICLE",
    TURNOVER_PER_KM_PER_TRAILER = "TURNOVER_PER_KM_PER_TRAILER",
    TURNOVER_PER_KM_PER_TRANSPORT_TAG = "TURNOVER_PER_KM_PER_TRANSPORT_TAG",
    TURNOVER_PER_KM_PER_SHIPPER = "TURNOVER_PER_KM_PER_SHIPPER",
}

export type ReportWidget = HorizontalChart & WidgetProps;

export type ReportWidgetFull = ReportWidget & {
    parameters?: ReportFiltersData;
    origin_area: Area;
    destination_area: Area;
};

export type ReportCreationFormValues = {
    name: string;
    category: ReportCategory;
    entity: ReportEntity;
    metric: ReportMetric;
};

export type ReportCategory = "orders" | "transports";

export type ReportEntity =
    | "carrier"
    | "vehicle"
    | "trucker"
    | "trailer"
    | "transport_tag"
    | "shipper";

export type ReportMetric = "count" | "cost" | "turnover" | "distance" | "turnover_per_km";

export const REPORTS_TYPES_WITH_PRICES = [
    ReportType.TRANSPORT_SUM_PRICING,
    ReportType.TRANSPORT_AVG_PRICING,
    ReportType.TURNOVER_PER_TRUCKER,
    ReportType.TURNOVER_PER_VEHICLE,
    ReportType.TURNOVER_PER_TRAILER,
    ReportType.TURNOVER_PER_TRANSPORT_TAG,
    ReportType.TURNOVER_PER_SHIPPER,
    ReportType.TURNOVER_PER_KM_PER_TRUCKER,
    ReportType.TURNOVER_PER_KM_PER_VEHICLE,
    ReportType.TURNOVER_PER_KM_PER_TRAILER,
    ReportType.TURNOVER_PER_KM_PER_TRANSPORT_TAG,
    ReportType.TURNOVER_PER_KM_PER_SHIPPER,
] as const;
