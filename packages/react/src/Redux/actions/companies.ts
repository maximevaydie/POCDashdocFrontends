import {t} from "@dashdoc/web-core";

import {fetchAdd, fetchUpdate} from "../../redux/actions/baseActionsEntities";
import {companySchema} from "../schemas";

export function fetchAddCompany(payload: any) {
    return fetchAdd(
        "companies",
        "company",
        payload,
        companySchema,
        t("common.updateSaved"),
        undefined
    );
}

export function fetchUpdateCompany(companyPk: number, payload: any) {
    return fetchUpdate({
        urlBase: "companies",
        objName: "company",
        uid: companyPk,
        obj: payload,
        objSchema: companySchema,
        successMessage: t("common.updateSaved"),
        apiVersion: "web",
    });
}
