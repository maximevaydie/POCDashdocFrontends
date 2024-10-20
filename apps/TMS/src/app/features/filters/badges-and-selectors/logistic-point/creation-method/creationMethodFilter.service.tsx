import {getStaticListFilter} from "@dashdoc/web-common";
import {FilterData} from "@dashdoc/web-common/src/features/filters/filtering-bar/filtering.types";
import {t} from "@dashdoc/web-core";

import {CreationMethodQuery} from "./types";

function getCreationMethodOptions(): {label: string; value: string}[] {
    return [
        {label: t("address.partner"), value: "partner"},
        {label: t("address.api"), value: "api"},
        {label: t("address.manager"), value: "manager"},
        {label: t("address.trucker"), value: "trucker"},
    ];
}

export function getCreationMethodFilter(): FilterData<CreationMethodQuery> {
    return getStaticListFilter({
        key: "creation-method",
        label: t("common.createdBy"),
        icon: "creator",
        items: getCreationMethodOptions(),
        queryKey: "creation_method__in",
        testId: "creation-method",
    });
}
