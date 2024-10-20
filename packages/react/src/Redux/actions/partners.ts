import {t} from "@dashdoc/web-core";

import {partnerDetailsSchema, partnersListSchema} from "../schemas";

import {fetchAdd, fetchSearch, fetchRetrieve, fetchUpdate} from "./baseActionsEntities";

import type {PartnerCreateInput, PartnerUpdateInput} from "../../types/partnerTypes";

export function fetchAddPartner(payload: PartnerCreateInput) {
    return fetchAdd(
        "partners",
        "partnerDetails",
        payload,
        partnerDetailsSchema,
        t("common.updateSaved"),
        undefined,
        "web"
    );
}

export function fetchUpdatePartner(companyPk: number, payload: PartnerUpdateInput) {
    return fetchUpdate({
        urlBase: "partners",
        objName: "partnerDetails",
        uid: companyPk,
        obj: payload,
        objSchema: partnerDetailsSchema,
        successMessage: t("common.updateSaved"),
        apiVersion: "web",
    });
}

export function fetchPartner(partnerPk: number) {
    return fetchRetrieve(
        "partners",
        "partnerDetails",
        partnerDetailsSchema,
        partnerPk,
        undefined,
        "web"
    );
}

export function fetchSearchPartners(queryName: string, query: any, page: number) {
    return fetchSearch(
        "partners",
        "partnersList",
        partnersListSchema,
        queryName,
        query,
        page,
        "web"
    );
}
