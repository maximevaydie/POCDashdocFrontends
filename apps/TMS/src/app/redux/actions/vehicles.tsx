import {fetchDetailAction, fetchListAction, fetchSearch} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {QualimatEvent, Vehicle, Unavailability} from "dashdoc-utils";

import {vehicleSchema} from "../schemas";

import {fetchAdd, fetchDelete, fetchRetrieve, fetchUpdate} from "./base-actions";

export function fetchSearchVehicles(queryName: string, query: any, page: number) {
    return fetchSearch("vehicles", "vehicle", vehicleSchema, queryName, query, page, "v4");
}

export function fetchRetrieveVehicle(vehiclePk: Vehicle["pk"]) {
    return fetchRetrieve("vehicles", "vehicle", vehiclePk.toString(), t("common.error"), "v4");
}

export function fetchAddVehicle(vehicle: Vehicle | any, errorMessageFn?: (error: any) => string) {
    return fetchAdd(
        "vehicles",
        "vehicle",
        vehicle,
        t("components.vehicleSuccessfullyAdded"),
        errorMessageFn,
        "v4"
    );
}

export function fetchUpdateVehicle(
    vehicle: Vehicle | any,
    errorMessageFn?: (error: any) => string
) {
    return fetchUpdate(
        "vehicles",
        "vehicle",
        vehicle,
        vehicle.pk,
        t("components.vehicleSuccessfullyEdited"),
        errorMessageFn,
        "v4"
    );
}

export function fetchDeleteVehicle(vehicle: Vehicle | any) {
    return fetchDelete(
        "vehicles",
        "vehicle",
        vehicle,
        t("components.vehicleSuccessfullyDeleted"),
        undefined,
        "v4"
    );
}

export function fetchAddVehicleQualimatEvent(vehiclePk: string, event: Partial<QualimatEvent>) {
    return fetchDetailAction(
        "vehicles",
        "vehicle",
        "qualimat-history",
        "POST",
        null,
        vehiclePk,
        event,
        null,
        undefined,
        undefined,
        "v4"
    );
}

export function fetchExportVehiclesQualimatHistory(
    filters: string,
    exportName: string,
    exportMethod: "download" | "email",
    email?: string
) {
    return fetchListAction(
        "vehicles",
        "vehicle",
        "export-qualimat-history",
        "POST",
        {},
        {export_name: exportName, export_method: exportMethod, email, filters},
        exportMethod === "email" ? t("common.emailSent") : undefined,
        undefined,
        "v4"
    );
}

export function fetchAddVehicleUnavailability(
    vehiclePk: number,
    data: Omit<Unavailability, "id">
) {
    return fetchDetailAction(
        "vehicles",
        "vehicle",
        "unavailability",
        "POST",
        null,
        String(vehiclePk),
        data,
        null,
        undefined,
        undefined,
        "v4"
    );
}

export function fetchUpdateVehicleUnavailability(
    vehiclePk: number,
    unavailabilityId: number,
    data: Unavailability
) {
    return fetchDetailAction(
        "vehicles",
        "vehicle",
        `unavailability/${unavailabilityId}`,
        "PATCH",
        null,
        String(vehiclePk),
        data,
        null,
        undefined,
        undefined,
        "v4"
    );
}

export function fetchDeleteVehicleUnavailability(vehiclePk: number, unavailabilityId: number) {
    return fetchDelete(`vehicles/${vehiclePk}/unavailability`, "unavailability", {
        pk: unavailabilityId,
    });
}
