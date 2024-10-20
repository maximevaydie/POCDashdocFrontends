import {FilterData, getStaticListFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

import {getLoadCategoryOptions} from "app/features/transport/load/load-form/load-form.helpers";
import {TariffGridsFilteringLoadCategoryQuery} from "app/screens/invoicing/filtering/tariffGridFiltering.types";

export function getLoadCategoryFilter(
    isQualimat: boolean
): FilterData<TariffGridsFilteringLoadCategoryQuery> {
    const items = getLoadCategoryOptions({isQualimat});

    return getStaticListFilter<TariffGridsFilteringLoadCategoryQuery>({
        key: "status",
        label: t("tariffGrids.Load"),
        icon: "load",
        items,
        queryKey: "load_category__in",
        testId: "load-category",
    });
}
