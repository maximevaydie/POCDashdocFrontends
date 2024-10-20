import {
    apiService,
    fetchDetailAction,
    fetchUpdate,
    getErrorMessage,
    getSuccessMessage,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {CoordinatesWithRadius} from "dashdoc-utils";
import {Dispatch} from "redux";

import {siteSchema} from "../schemas";

import type {Site} from "app/types/transport";

export function fetchUpdateSite(uid: string, site: Partial<Site> & {extended_view?: boolean}) {
    return fetchUpdate({
        urlBase: "sites",
        objName: "site",
        uid: uid,
        obj: site,
        objSchema: siteSchema,
        apiVersion: "v4",
    });
}

export function fetchMarkSiteDone(
    siteUid: string,
    type: "loading" | "unloading",
    onSiteDate?: string,
    completeDate?: string,
    vehiclePlate?: string,
    trailerPlates?: string[]
) {
    return fetchDetailAction(
        "sites",
        "site",
        "mark-done",
        "POST",
        null,
        siteUid,
        {
            category: type,
            on_site_date: onSiteDate,
            complete_date: completeDate,
            vehiclePlate,
            trailerPlates,
        },
        siteSchema,
        t("common.updateSaved"),
        undefined
    );
}

function enableETAAction(uid: string) {
    return {
        type: "ENABLE_ETA",
        uid,
    };
}

function enableETAActionSuccess(uid: string) {
    return {
        type: "ENABLE_ETA_SUCCESS",
        uid,
    };
}

function enableETAActionError(uid: string) {
    return {
        type: "ENABLE_ETA_ERROR",
        uid,
    };
}

/**
 * Enable ETA for a given site
 * @param uid The uid of the site to enable ETA on
 */
export function fetchEnableETA(uid: string) {
    return function (dispatch: Dispatch<any>) {
        dispatch(enableETAAction(uid));
        apiService.post(`/sites/${uid}/enable-eta/`).then(
            () => {
                toast.success(getSuccessMessage(t("eta.etaActivationSuccess")));
                return dispatch(enableETAActionSuccess(uid));
            },
            (error) => {
                getErrorMessage(error, t("eta.etaActivationError")).then((message) => {
                    toast.error(message);
                });
                return dispatch(enableETAActionError(uid));
            }
        );
    };
}

function validateAddressCoordinatesAction(address: {
    pk: number;
    coordinates: CoordinatesWithRadius;
    siteUid: string;
}) {
    return {
        type: "VALIDATE_COORDINATES",
        address,
    };
}

function validateAddressCoordinatesActionSuccess(address: {
    pk: number;
    coordinates: CoordinatesWithRadius;
    siteUid: string;
}) {
    return {
        type: "VALIDATE_COORDINATES_SUCCESS",
        address,
    };
}

function validateAddressCoordinatesActionError(address: {
    pk: number;
    coordinates: CoordinatesWithRadius;
    siteUid: string;
}) {
    return {
        type: "VALIDATE_COORDINATES_ERROR",
        address,
    };
}

/**
 * Used to validate the coordinates of the address of a site
 * @param site
 * @param coordinates
 */
export function fetchValidateAddressCoordinates(
    siteUid: string,
    addressPk: number,
    coordinates: CoordinatesWithRadius
) {
    return function (dispatch: Function) {
        const obj = {pk: addressPk, coordinates, siteUid};
        dispatch(validateAddressCoordinatesAction(obj));

        apiService.Activities.validateAddressCoordinates(siteUid, coordinates).then(
            () => {
                toast.success(getSuccessMessage(t("common.success")));
                return dispatch(validateAddressCoordinatesActionSuccess(obj));
            },
            (error) => {
                getErrorMessage(error, t("common.error")).then((message) => {
                    toast.error(message);
                });
                return dispatch(validateAddressCoordinatesActionError(obj));
            }
        );
    };
}

export const fetchMarkActivityUndone = (activityUid: string) => {
    return fetchDetailAction(
        "sites",
        "site",
        "mark-undone",
        "POST",
        null,
        activityUid,
        null,
        null,
        t("common.updateSaved"),
        undefined,
        "v4"
    );
};

export const fetchMarkBreakingAndResumingActivitiesUndone = (breakActivityUid: string) => {
    return fetchDetailAction(
        "sites",
        "site",
        "mark-breaking-and-resuming-activities-undone",
        "POST",
        null,
        breakActivityUid,
        null,
        null,
        t("common.updateSaved"),
        undefined,
        "v4"
    );
};

export const fetchAmendRealDate = (
    activityUid: string,
    payload: {real_start: string; real_end: string}
) => {
    return fetchDetailAction(
        "sites",
        "site",
        "amend-real-date",
        "POST",
        null,
        activityUid,
        payload,
        null,
        t("common.updateSaved"),
        undefined,
        "v4"
    );
};

export function fetchSetActivityCarbonFootprint(
    activityUid: string,
    manualEmissionValue: number | null
) {
    return fetchDetailAction(
        "sites",
        "site",
        "set-carbon-footprint",
        "POST",
        null,
        activityUid,
        {
            manual_emission_value: manualEmissionValue,
        },
        null,
        t("common.updateSaved"),
        undefined,
        "web"
    );
}
