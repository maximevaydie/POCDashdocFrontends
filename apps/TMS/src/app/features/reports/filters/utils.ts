import {Period} from "@dashdoc/web-common";
import {TransportsBusinessStatus} from "@dashdoc/web-common/src/types/businessStatusTypes";
import {
    PeriodFilter,
    PeriodType,
    ReportFiltersData,
    ReportType,
} from "@dashdoc/web-common/src/types/reportsTypes";
import {
    ReportCreationFormValues,
    ReportWidgetFull,
} from "@dashdoc/web-common/src/types/reportsTypes";
import {dateRangePickerDefaultStaticRanges, StaticRange} from "@dashdoc/web-ui";
import {Area, formatDate} from "dashdoc-utils";
import {addDays, endOfDay, startOfDay} from "date-fns";

export const staticRanges: Record<string, StaticRange> = {
    yesterday: {
        label: "dateRangePicker.staticRanges.yesterday",
        range: {
            getStartDate: () => startOfDay(addDays(new Date(), -1)),
            getEndDate: () => endOfDay(addDays(new Date(), -1)),
        },
    },
    last_week: dateRangePickerDefaultStaticRanges["last_week"],
    last_month: dateRangePickerDefaultStaticRanges["last_month"],
};

export const getReportType = (formValues: ReportCreationFormValues) => {
    const reportKey = `${formValues.category}_${formValues.metric}_${formValues.entity}`;
    switch (reportKey) {
        case "orders_cost_carrier":
            return ReportType.TRANSPORT_SUM_PRICING;
        case "orders_count_carrier":
            return ReportType.TRANSPORT_COUNT;
        case "transports_turnover_trucker":
            return ReportType.TURNOVER_PER_TRUCKER;
        case "transports_turnover_vehicle":
            return ReportType.TURNOVER_PER_VEHICLE;
        case "transports_turnover_trailer":
            return ReportType.TURNOVER_PER_TRAILER;
        case "transports_turnover_transport_tag":
            return ReportType.TURNOVER_PER_TRANSPORT_TAG;
        case "transports_turnover_shipper":
            return ReportType.TURNOVER_PER_SHIPPER;
        case "transports_distance_trucker":
            return ReportType.DISTANCE_PER_TRUCKER;
        case "transports_distance_vehicle":
            return ReportType.DISTANCE_PER_VEHICLE;
        case "transports_distance_trailer":
            return ReportType.DISTANCE_PER_TRAILER;
        case "transports_distance_transport_tag":
            return ReportType.DISTANCE_PER_TRANSPORT_TAG;
        case "transports_distance_shipper":
            return ReportType.DISTANCE_PER_SHIPPER;
        case "transports_turnover_per_km_trucker":
            return ReportType.TURNOVER_PER_KM_PER_TRUCKER;
        case "transports_turnover_per_km_vehicle":
            return ReportType.TURNOVER_PER_KM_PER_VEHICLE;
        case "transports_turnover_per_km_trailer":
            return ReportType.TURNOVER_PER_KM_PER_TRAILER;
        case "transports_turnover_per_km_transport_tag":
            return ReportType.TURNOVER_PER_KM_PER_TRANSPORT_TAG;
        case "transports_turnover_per_km_shipper":
            return ReportType.TURNOVER_PER_KM_PER_SHIPPER;
        default:
            return null;
    }
};

export const getReportFiltersDisplaySettings = (reportType: ReportType) => {
    const filtersDisplaySettings = {
        origin_area: true,
        destination_area: true,
        period: true,
        vehicle_type: true,
        shippers: true,
        transport_status: true,
    };

    switch (reportType) {
        case ReportType.TURNOVER_PER_TRANSPORT_TAG:
        case ReportType.TURNOVER_PER_TRAILER:
        case ReportType.TURNOVER_PER_VEHICLE:
        case ReportType.TURNOVER_PER_TRUCKER:
        case ReportType.TURNOVER_PER_SHIPPER:
        case ReportType.DISTANCE_PER_TRUCKER:
        case ReportType.DISTANCE_PER_VEHICLE:
        case ReportType.DISTANCE_PER_TRAILER:
        case ReportType.DISTANCE_PER_TRANSPORT_TAG:
        case ReportType.DISTANCE_PER_SHIPPER:
        case ReportType.TURNOVER_PER_KM_PER_TRUCKER:
        case ReportType.TURNOVER_PER_KM_PER_VEHICLE:
        case ReportType.TURNOVER_PER_KM_PER_TRAILER:
        case ReportType.TURNOVER_PER_KM_PER_TRANSPORT_TAG:
        case ReportType.TURNOVER_PER_KM_PER_SHIPPER:
            filtersDisplaySettings.origin_area = false;
            filtersDisplaySettings.destination_area = false;
            filtersDisplaySettings.vehicle_type = false;
            break;
        case ReportType.TRANSPORT_COUNT:
        case ReportType.TRANSPORT_AVG_PRICING:
        case ReportType.TRANSPORT_SUM_PRICING:
            filtersDisplaySettings.shippers = false;
            filtersDisplaySettings.transport_status = false;
            break;
    }

    return filtersDisplaySettings;
};

export type ReportQuery = {
    origin_area?: Area | null;
    destination_area?: Area | null;
    transport_status__in: TransportsBusinessStatus[];
    shipper__in: string[];
    requested_vehicle__in: string[];
} & (LoadingReportQuery & UnloadingReportQuery & LoadingAndUnloadingReportQuery);

type LoadingReportQuery = {
    loading_period?: Period | null;
    loading_start_date?: string | null;
    loading_end_date?: string | null;
};
type UnloadingReportQuery = {
    unloading_period?: Period | null;
    unloading_start_date?: string | null;
    unloading_end_date?: string | null;
};
type LoadingAndUnloadingReportQuery = {
    period?: Period | null;
    start_date?: string | null;
    end_date?: string | null;
};
export function getReportQueryFromWidget(widget: ReportWidgetFull) {
    let query: ReportQuery = {
        origin_area: widget.origin_area,
        destination_area: widget.destination_area,

        start_date: undefined,
        end_date: undefined,
        period: undefined,

        loading_start_date: undefined,
        loading_end_date: undefined,
        loading_period: undefined,

        unloading_start_date: undefined,
        unloading_end_date: undefined,
        unloading_period: undefined,

        transport_status__in: [],
        shipper__in: [],
        requested_vehicle__in: [],
    };
    if (widget.parameters?.period) {
        let prefix: "" | "loading_" | "unloading_";
        switch (widget.parameters.period.date_type) {
            case "LOADING":
                prefix = "loading_";
                break;
            case "UNLOADING":
                prefix = "unloading_";
                break;
            default: // case "LOADING_AND_UNLOADING":
                prefix = "";
        }
        query[`${prefix}start_date`] = widget.parameters.period.date_start;
        query[`${prefix}end_date`] = widget.parameters.period.date_end;
        query[`${prefix}period`] =
            widget.parameters.period.period_type === "static"
                ? undefined
                : (widget.parameters.period.period_type as Period);
    } else {
        query.period = "last_month";
    }
    if (widget.parameters?.requested_vehicle) {
        query.requested_vehicle__in = widget.parameters?.requested_vehicle;
    }
    if (widget.parameters?.shippers) {
        query.shipper__in = widget.parameters?.shippers.map((shipper) => `${shipper.pk}`);
    }
    if (widget.parameters?.business_statuses) {
        query.transport_status__in = widget.parameters?.business_statuses;
    }
    return query;
}
export function getWidgetFromReportQuery(query: Partial<ReportQuery>) {
    const {origin_area, destination_area, ...parameters} = query;
    let widget: {
        parameters?: ReportFiltersData;
        origin_area?: Area | null;
        destination_area?: Area | null;
    } = {};
    if ("origin_area" in query) {
        widget["origin_area"] = origin_area;
    }
    if ("destination_area" in query) {
        widget["destination_area"] = destination_area;
    }
    if (Object.keys(parameters).length > 0) {
        ["", "loading_", "unloading_"].map((prefix) => {
            const startDateKey = `${prefix}start_date` as
                | "start_date"
                | "loading_start_date"
                | "unloading_start_date";
            const endDateKey = `${prefix}end_date` as
                | "end_date"
                | "loading_end_date"
                | "unloading_end_date";
            const periodKey = `${prefix}period` as
                | "period"
                | "loading_period"
                | "unloading_period";
            const dateType =
                prefix === "loading_"
                    ? "LOADING"
                    : prefix === "unloading_"
                      ? "UNLOADING"
                      : "LOADING_AND_UNLOADING";

            if (startDateKey in query || periodKey in query) {
                if (!widget.parameters) {
                    widget["parameters"] = {};
                }
                if (!query[startDateKey] && !query[endDateKey] && !query[periodKey]) {
                    widget.parameters.period = DEFAULT_PERIOD;
                } else {
                    widget.parameters.period = {
                        date_start:
                            formatDate(query[startDateKey], "yyyy-MM-dd") ??
                            formatDate(query[endDateKey], "yyyy-MM-dd") ??
                            undefined,
                        date_end:
                            formatDate(query[endDateKey], "yyyy-MM-dd") ??
                            formatDate(query[startDateKey], "yyyy-MM-dd") ??
                            undefined,
                        period_type: (query[periodKey] as PeriodType) ?? "static",
                        date_type: dateType,
                    };
                }
            }
        });

        if ("requested_vehicle__in" in query) {
            if (!widget.parameters) {
                widget["parameters"] = {};
            }
            widget.parameters.requested_vehicle = query.requested_vehicle__in;
        }
        if ("shipper__in" in query && query.shipper__in) {
            if (!widget.parameters) {
                widget["parameters"] = {};
            }
            widget.parameters.shippers = query.shipper__in.map((id) => ({
                pk: Number(id),
                name: "",
            }));
        }
        if ("transport_status__in" in query) {
            if (!widget.parameters) {
                widget["parameters"] = {};
            }
            widget.parameters.business_statuses = query.transport_status__in;
        }
    }
    return widget;
}

const DEFAULT_PERIOD: PeriodFilter = {
    date_start: undefined,
    date_end: undefined,
    period_type: "last_month",
    date_type: "LOADING_AND_UNLOADING",
};
