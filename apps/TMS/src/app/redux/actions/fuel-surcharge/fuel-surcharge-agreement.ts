import {t} from "@dashdoc/web-core";
import {
    FuelPriceIndex,
    FuelSurchargeAgreement,
    FuelSurchargeAgreementPayload,
} from "dashdoc-utils";

import {fetchAdd, fetchDelete, fetchRetrieve, fetchUpdate} from "app/redux/actions/base-actions";

export function fetchUpdateFuelSurchargeAgreement(
    uid: FuelSurchargeAgreement["uid"],
    payload: FuelSurchargeAgreementPayload
) {
    return fetchUpdate(
        "fuel-surcharge-agreements",
        "fuel_surcharge_agreement",
        payload,
        uid,
        t("common.updateSaved"),
        t("common.error"),
        "v4"
    );
}
export function fetchDeleteFuelSurchargeAgreement(uid: FuelSurchargeAgreement["uid"]) {
    return fetchDelete(
        "fuel-surcharge-agreements",
        "fuel_surcharge_agreement",
        {pk: uid},
        t("common.deleted"),
        t("common.error"),
        "v4"
    );
}

export type AddFuelSurchargeAgreement = Omit<FuelSurchargeAgreement, "fuel_price_index"> & {
    fuel_price_index_uid: FuelPriceIndex["uid"];
};

export function fetchAddFuelSurchargeAgreement(
    fuelSurchargeAgreeement: AddFuelSurchargeAgreement
) {
    return fetchAdd(
        "fuel-surcharge-agreements",
        "fuel_surcharge_agreement",
        fuelSurchargeAgreeement,
        t("common.add"),
        t("common.error"),
        "v4"
    );
}

export function fetchFuelSurchargeAgreement(uid: FuelSurchargeAgreement["uid"]) {
    return fetchRetrieve("fuel-surcharge-agreements", "fuel_surcharge_agreement", uid, null, "v4");
}
