import {fetchListAction} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {FuelPriceIndex} from "dashdoc-utils";

import {fetchAdd, fetchDelete, fetchRetrieve, fetchUpdate} from "app/redux/actions/base-actions";

export type BulkUpdateFuelPriceIndex = {
    uid: FuelPriceIndex["uid"];
    application_date: string;
    updated_price: number;
};

export function fetchBulkUpdateFuelPriceIndexes(payload: BulkUpdateFuelPriceIndex[]) {
    return fetchListAction(
        "fuel-price-indexes",
        "fuel_price_index",
        "bulk-update-prices",
        "POST",
        null,
        payload,
        t("common.updateSaved"),
        t("common.error"),
        "v4"
    );
}

export function fetchPreviewUpdateFuelPriceIndex(payload: BulkUpdateFuelPriceIndex) {
    return fetchListAction(
        `fuel-price-indexes/${payload.uid}`,
        "fuel_price_index",
        "preview-update-price",
        "POST",
        null,
        payload,
        null,
        t("common.error"),
        "v4"
    );
}

export function fetchFuelPriceIndexes(query: string, page: number) {
    return fetchListAction(
        "fuel-price-indexes",
        "fuel_price_index",
        null,
        "GET",
        {
            search: query,
            page: page,
        },
        null,
        null,
        null,
        "v4"
    );
}

export function fetchAddFuelPriceIndex(fuelPriceIndex: Partial<FuelPriceIndex>) {
    return fetchAdd(
        "fuel-price-indexes",
        "fuel_price_index",
        fuelPriceIndex,
        t("common.add"),
        t("common.error"),
        "v4"
    );
}

export function fetchUpdateFuelPriceIndex(
    uid: FuelPriceIndex["uid"],
    fuelPriceIndex: Partial<FuelPriceIndex>
) {
    return fetchUpdate(
        "fuel-price-indexes",
        "fuel_price_index",
        fuelPriceIndex,
        uid,
        t("common.updateSaved"),
        t("common.error"),
        "v4"
    );
}

export function fetchDeleteFuelPriceIndex(uid: FuelPriceIndex["uid"]) {
    return fetchDelete(
        "fuel-price-indexes",
        "fuel_price_index",
        {pk: uid},
        t("common.deleted"),
        t("common.error"),
        "v4"
    );
}

export function fetchFuelPriceIndex(uid: FuelPriceIndex["uid"]) {
    return fetchRetrieve("fuel-price-indexes", "fuel_price_index", uid, null, "v4");
}
