import {FilteringPaginatedListSelector} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringPaginatedListSelector";
import {FilteringHeader} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringSelectorHeader";
import {t} from "@dashdoc/web-core";
import {Trucker} from "dashdoc-utils";
import React, {useCallback} from "react";

import {useExtendedView} from "app/hooks/useExtendedView";

import {TruckersQuery} from "./truckerFilter.types";

type Props = {
    query: TruckersQuery;
    updateQuery: (query: TruckersQuery) => void;
    sortAndFilters?: {
        ordering?: string;
        tags__in?: string[];
        extended_view?: boolean;
        id__in?: string[];
    };
};

export function TruckerSelector({query, updateQuery, sortAndFilters}: Props) {
    const {extendedView} = useExtendedView();
    const formatItemLabel = useCallback((trucker: Trucker) => {
        let label = trucker.user.last_name + " " + trucker.user.first_name;
        if (trucker.is_disabled == true) {
            label = `${label} (${t("common.disabled")})`;
        }
        return label;
    }, []);

    return (
        <>
            <FilteringHeader dataTypeLabel={t("common.trucker")} conditionLabel={t("filter.in")} />
            <FilteringPaginatedListSelector<Trucker>
                fetchItemsUrl="manager-truckers/"
                searchQueryKey="text"
                additionalQueryParams={{
                    extended_view: extendedView,
                    ...sortAndFilters,
                }}
                getItemId={(item) => `${item.pk}`}
                getItemLabel={formatItemLabel}
                values={query.trucker__in ?? []}
                onChange={(value) => updateQuery({trucker__in: value})}
            />
        </>
    );
}
