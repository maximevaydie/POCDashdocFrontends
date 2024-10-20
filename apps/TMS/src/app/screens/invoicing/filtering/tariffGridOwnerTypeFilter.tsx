import {FilterData, getStaticListFilter} from "@dashdoc/web-common";
import {t, TranslationKeys} from "@dashdoc/web-core";

import {TariffGridsFilteringOwnerTypeQuery} from "app/screens/invoicing/filtering/tariffGridFiltering.types";

const ITEMS: {translationKey: TranslationKeys; value: "carrier" | "shipper"}[] = [
    {translationKey: "tariffGrids.ownerTypeCarrier", value: "carrier"},
    {translationKey: "tariffGrids.ownerTypeShipper", value: "shipper"},
];

export function getOwnerTypeFilter(): FilterData<TariffGridsFilteringOwnerTypeQuery> {
    const items = ITEMS.map((choice) => ({
        label: t(choice.translationKey),
        value: choice.value,
    }));

    return getStaticListFilter<TariffGridsFilteringOwnerTypeQuery>({
        key: "status",
        label: t("tariffGrids.ownerType"),
        icon: "checkList",
        items,
        queryKey: "owner_type__in",
        testId: "owner-type",
    });
}
