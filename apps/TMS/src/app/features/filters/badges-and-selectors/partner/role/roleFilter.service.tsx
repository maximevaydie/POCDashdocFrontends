import {FilterData, getStaticChoiceFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

import {RoleQuery} from "./types";

export function getRoleFilter(): FilterData<RoleQuery> {
    const items = [
        {label: t("common.carrier"), value: "carrier"},
        {label: t("common.shipper"), value: "shipper"},
    ];

    return getStaticChoiceFilter<RoleQuery>({
        key: "role__in",
        label: t("common.type"),
        icon: "businessCard",
        items,
        queryKey: "role__in",
        testId: "role__in",
    });
}
