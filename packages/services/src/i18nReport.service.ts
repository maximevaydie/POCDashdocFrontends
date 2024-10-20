import {formatNumber} from "dashdoc-utils";

import {t} from "./i18n.service";

function getReportLabel(type: string) {
    switch (type) {
        case "TURNOVER_PER_TRUCKER":
            return t("reports.transports.turnoverPerTrucker.label");
        case "TURNOVER_PER_TRAILER":
            return t("reports.transports.turnoverPerTrailer.label");
        case "TURNOVER_PER_VEHICLE":
            return t("reports.transports.turnoverPerVehicle.label");
        case "TURNOVER_PER_TRANSPORT_TAG":
            return t("reports.transports.turnoverPerTransportTag.label");
        case "TURNOVER_PER_SHIPPER":
            return t("reports.transports.turnoverPerShipper.label");
        case "DISTANCE_PER_TRUCKER":
            return t("reports.transports.distancePerTrucker.label");
        case "DISTANCE_PER_TRAILER":
            return t("reports.transports.distancePerTrailer.label");
        case "DISTANCE_PER_VEHICLE":
            return t("reports.transports.distancePerVehicle.label");
        case "DISTANCE_PER_TRANSPORT_TAG":
            return t("reports.transports.distancePerTransportTag.label");
        case "DISTANCE_PER_SHIPPER":
            return t("reports.transports.distancePerShipper.label");
        case "TURNOVER_PER_KM_PER_TRUCKER":
            return t("reports.transports.turnoverPerKmPerTrucker.label");
        case "TURNOVER_PER_KM_PER_TRAILER":
            return t("reports.transports.turnoverPerKmPerTrailer.label");
        case "TURNOVER_PER_KM_PER_VEHICLE":
            return t("reports.transports.turnoverPerKmPerVehicle.label");
        case "TURNOVER_PER_KM_PER_TRANSPORT_TAG":
            return t("reports.transports.turnoverPerKmPerTransportTag.label");
        case "TURNOVER_PER_KM_PER_SHIPPER":
            return t("reports.transports.turnoverPerKmPerShipper.label");
        case "TRANSPORT_SUM_PRICING":
            return t("reports.orders.costPerCarrier.label");
        case "TRANSPORT_AVG_PRICING":
            return t("reports.orders.avgCostPerCarrier.label");
        case "TRANSPORT_COUNT":
            return t("reports.orders.orderCountPerCarrier.label");
        default:
            return "";
    }
}

function getTotalCalculationLabel(reportType: string) {
    switch (reportType) {
        case "TURNOVER_PER_TRUCKER":
        case "TURNOVER_PER_TRAILER":
        case "TURNOVER_PER_VEHICLE":
        case "TURNOVER_PER_TRANSPORT_TAG":
        case "TURNOVER_PER_SHIPPER":
            return t("reports.totalTurnover");
        case "DISTANCE_PER_TRUCKER":
        case "DISTANCE_PER_TRAILER":
        case "DISTANCE_PER_VEHICLE":
        case "DISTANCE_PER_TRANSPORT_TAG":
        case "DISTANCE_PER_SHIPPER":
            return t("reports.totalDistance");
        case "TURNOVER_PER_KM_PER_TRUCKER":
        case "TURNOVER_PER_KM_PER_TRAILER":
        case "TURNOVER_PER_KM_PER_VEHICLE":
        case "TURNOVER_PER_KM_PER_TRANSPORT_TAG":
        case "TURNOVER_PER_KM_PER_SHIPPER":
            return t("reports.totalTurnOverPerKm");
        case "TRANSPORT_SUM_PRICING":
        case "TRANSPORT_AVG_PRICING":
            return t("reports.totalCost");
        case "TRANSPORT_COUNT":
            return t("reports.totalCount");
        default:
            return "";
    }
}

function getValueLabel(value: string | number, reportType: string) {
    switch (reportType) {
        case "TURNOVER_PER_TRUCKER":
        case "TURNOVER_PER_TRAILER":
        case "TURNOVER_PER_VEHICLE":
        case "TURNOVER_PER_TRANSPORT_TAG":
        case "TURNOVER_PER_SHIPPER":
        case "TURNOVER_PER_KM_PER_TRUCKER":
        case "TURNOVER_PER_KM_PER_TRAILER":
        case "TURNOVER_PER_KM_PER_VEHICLE":
        case "TURNOVER_PER_KM_PER_TRANSPORT_TAG":
        case "TURNOVER_PER_KM_PER_SHIPPER":
        case "TRANSPORT_SUM_PRICING":
        case "TRANSPORT_AVG_PRICING":
            return formatNumber(value, {
                style: "currency",
                currency: "EUR",
            });
        case "DISTANCE_PER_TRUCKER":
        case "DISTANCE_PER_TRAILER":
        case "DISTANCE_PER_VEHICLE":
        case "DISTANCE_PER_TRANSPORT_TAG":
        case "DISTANCE_PER_SHIPPER":
            return formatNumber(value, {
                style: "unit",
                unit: "kilometer",
                maximumFractionDigits: 1,
            });
        default:
            return String(value);
    }
}

export const i18nReportService = {
    getReportLabel,
    getTotalCalculationLabel,
    getValueLabel,
};
