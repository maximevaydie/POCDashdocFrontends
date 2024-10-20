import {FilterData} from "@dashdoc/web-common/src/features/filters/filtering-bar/filtering.types";
import {t} from "@dashdoc/web-core";
import React from "react";

import {TruckerBadge} from "./TruckerBadge";
import {TruckersQuery} from "./truckerFilter.types";
import {TruckerSelector} from "./TruckerSelector";

export function getTruckerFilter(sortAndFilters = {}): FilterData<TruckersQuery> {
    return {
        key: "trucker",
        testId: "trucker",
        selector: {
            label: t("common.trucker"),
            icon: "trucker",
            getFilterSelector: (query, updateQuery) => (
                <TruckerSelector
                    query={query}
                    updateQuery={updateQuery}
                    sortAndFilters={sortAndFilters}
                />
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: query["trucker__in"]?.length ?? 0,
                badge: <TruckerBadge key="trucker" query={query} updateQuery={updateQuery} />,
            },
        ],
    };
}
