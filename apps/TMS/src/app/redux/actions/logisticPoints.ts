import {LogisticPoint, fetchDelete, fetchListAction, fetchSearch} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

import {logisticPointSchema} from "../schemas";

import type {LogisticPointsQuery} from "app/features/address-book/logistic-points/types";

export function fetchSearchLogisticPointsAddressBook(
    queryName: string,
    query: LogisticPointsQuery,
    page: number
) {
    return fetchSearch(
        "logistic-points",
        "logistic-point",
        logisticPointSchema,
        queryName,
        query,
        page,
        "web"
    );
}

export function fetchDeleteLogisticPoints(
    deletionQuery:
        | LogisticPointsQuery
        | {
              pk__in: number[];
          }
) {
    return fetchListAction(
        "logistic-points",
        "logistic-point",
        null,
        "DELETE",
        deletionQuery,
        {},
        undefined,
        undefined,
        "web"
    );
}

export function fetchDeleteLogisticPoint(logisticPoint: number | LogisticPoint) {
    const logisticPointPk = typeof logisticPoint === "number" ? logisticPoint : logisticPoint.pk;
    return fetchDelete(
        "addresses",
        "logistic-point",
        logisticPointPk,
        t("addresses.addressSuccessfullyDeleted")
    );
}

export function fetchExportLogisticPoints(
    filters: string,
    exportName: string,
    exportMethod: "download" | "email",
    email: string
) {
    return fetchListAction(
        "address-book",
        "logistic-point",
        "export",
        "POST",
        {},
        {export_name: exportName, export_method: exportMethod, email, filters},
        exportMethod === "email" ? t("common.emailSent") : undefined,
        undefined,
        "web"
    );
}

export function fetchExportLogisticPointsFromCompanies(
    filters: string,
    exportName: string,
    exportMethod: "download" | "email",
    email?: string,
    isShipperExport?: boolean
) {
    return fetchListAction(
        "companies",
        "logistic-point",
        "export-addresses",
        "POST",
        {},
        {
            export_name: exportName,
            export_method: exportMethod,
            email,
            filters,
            is_shipper_export: isShipperExport,
        },
        exportMethod === "email" ? t("common.emailSent") : undefined,
        undefined,
        "v4"
    );
}
