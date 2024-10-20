import {fetchAdd, fetchSearch, fetchUpdate} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {RequestedVehicle, RequestedVehicleInput} from "dashdoc-utils";

import {requestedVehicleSchema} from "../schemas";

export function fetchSearchRequestedVehicles(
    queryName: string,
    query: {text?: string[]},
    page: number
) {
    return fetchSearch(
        "requested-vehicles",
        "requested-vehicles",
        requestedVehicleSchema,
        queryName,
        query,
        page,
        "web"
    );
}

export function fetchAddRequestedVehicle(requestedVehicle: RequestedVehicleInput) {
    return fetchAdd(
        "requested-vehicles",
        "requested-vehicles",
        requestedVehicle,
        requestedVehicleSchema,
        t("components.requestedVehicle.successfullyAdded"),
        undefined,
        "web"
    );
}

export function fetchUpdateRequestedVehicle(
    requestedVehicle: Pick<RequestedVehicle, "uid"> & Partial<RequestedVehicleInput>
) {
    return fetchUpdate({
        urlBase: "requested-vehicles",
        obj: requestedVehicle,
        objName: "requested-vehicles",
        objSchema: requestedVehicleSchema,
        uid: requestedVehicle.uid,
        successMessage: t("components.requestedVehicle.successfullyEdited"),
        apiVersion: "web",
    });
}
