import {fetchDetailAction, fetchListAction, fetchSearch} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {QualimatEvent, Trailer, Unavailability} from "dashdoc-utils";

import {trailerSchema} from "../schemas";

import {fetchAdd, fetchDelete, fetchRetrieve, fetchUpdate} from "./base-actions";

export function fetchSearchTrailers(queryName: string, query: any, page: number) {
    return fetchSearch("trailers", "trailer", trailerSchema, queryName, query, page, "v4");
}

export function fetchRetrieveTrailer(trailerPk: Trailer["pk"]) {
    return fetchRetrieve("trailers", "trailer", trailerPk.toString(), t("common.error"), "v4");
}

export function fetchAddTrailer(trailer: Trailer | any, errorMessageFn?: (error: any) => string) {
    return fetchAdd(
        "trailers",
        "trailer",
        trailer,
        t("settings.addTrailerSuccess"),
        errorMessageFn,
        "v4"
    );
}

export function fetchUpdateTrailer(
    trailer: Trailer | any,
    errorMessageFn?: (error: any) => string
) {
    return fetchUpdate(
        "trailers",
        "trailer",
        trailer,
        trailer.pk,
        t("settings.editTrailerSuccess"),
        errorMessageFn,
        "v4"
    );
}

export function fetchDeleteTrailer(trailer: Trailer | any) {
    return fetchDelete(
        "trailers",
        "trailer",
        trailer,
        t("settings.removeTrailerSuccess"),
        undefined,
        "v4"
    );
}

export function fetchAddTrailerQualimatEvent(trailerPk: string, event: Partial<QualimatEvent>) {
    return fetchDetailAction(
        "trailers",
        "trailer",
        "qualimat-history",
        "POST",
        null,
        trailerPk,
        event,
        null,
        undefined,
        undefined,
        "v4"
    );
}

export function fetchExportTrailersQualimatHistory(
    filters: string,
    exportName: string,
    exportMethod: "download" | "email",
    email?: string
) {
    return fetchListAction(
        "trailers",
        "trailer",
        "export-qualimat-history",
        "POST",
        {},
        {export_name: exportName, export_method: exportMethod, email, filters},
        exportMethod === "email" ? t("common.emailSent") : undefined,
        undefined,
        "v4"
    );
}

export function fetchAddTrailerUnavailability(
    trailerPk: number,
    data: Omit<Unavailability, "id">
) {
    return fetchDetailAction(
        "trailers",
        "trailer",
        "unavailability",
        "POST",
        null,
        String(trailerPk),
        data,
        null,
        undefined,
        undefined,
        "v4"
    );
}

export function fetchUpdateTrailerUnavailability(
    trailerPk: number,
    unavailabilityId: number,
    data: Unavailability
) {
    return fetchDetailAction(
        "trailers",
        "trailer",
        `unavailability/${unavailabilityId}`,
        "PATCH",
        null,
        String(trailerPk),
        data,
        null,
        undefined,
        undefined,
        "v4"
    );
}

export function fetchDeleteTrailerUnavailability(trailerPk: number, unavailabilityId: number) {
    return fetchDelete(`trailers/${trailerPk}/unavailability`, "unavailability", {
        pk: unavailabilityId,
    });
}
