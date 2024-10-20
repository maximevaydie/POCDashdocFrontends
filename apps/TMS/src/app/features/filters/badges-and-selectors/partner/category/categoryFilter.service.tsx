import {FilterData, getStaticChoiceFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

import {CategoryQuery} from "./types";

export function getCategoryFilter(): FilterData<CategoryQuery> {
    const items = [
        {label: t("common.carrier"), value: "carrier"},
        {label: t("common.shipper"), value: "shipper"},
    ];

    return getStaticChoiceFilter<CategoryQuery>({
        key: "category",
        label: t("common.type"),
        icon: "businessCard",
        items,
        queryKey: "category",
        testId: "category",
    });
}
