import {FilterData, getStaticListFilter} from "@dashdoc/web-common";
import {t, TranslationKeys} from "@dashdoc/web-core";

import {TariffGridsFilteringStatusQuery} from "app/screens/invoicing/filtering/tariffGridFiltering.types";

const ITEMS: {translationKey: TranslationKeys; value: "active" | "inactive"}[] = [
    {translationKey: "common.enabled.female", value: "active"},
    {translationKey: "common.disabled.female", value: "inactive"},
];

export function getStatusFilter(): FilterData<TariffGridsFilteringStatusQuery> {
    const items = ITEMS.map((choice) => ({
        label: t(choice.translationKey),
        value: choice.value,
    }));

    return getStaticListFilter<TariffGridsFilteringStatusQuery>({
        key: "status",
        label: t("tariffGrids.Status"),
        icon: "checkList",
        items,
        queryKey: "status__in",
        testId: "status",
    });
}
