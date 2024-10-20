import {FilterData} from "@dashdoc/web-common/src/features/filters/filtering-bar/filtering.types";
import {t} from "@dashdoc/web-core";
import React from "react";

import {TrailerBadge} from "./TrailerBadge";
import {TrailersQuery} from "./trailerFilter.types";
import {TrailerSelector} from "./TrailerSelector";

export function getTrailerFilter(sortAndFilters = {}): FilterData<TrailersQuery> {
    return {
        key: "trailer",
        testId: "trailer",
        selector: {
            label: t("common.trailer"),
            icon: "trailer",
            getFilterSelector: (query, updateQuery) => (
                <TrailerSelector
                    query={query}
                    updateQuery={updateQuery}
                    sortAndFilters={sortAndFilters}
                />
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: query["trailer__in"]?.length ?? 0,
                badge: <TrailerBadge key="trailer" query={query} updateQuery={updateQuery} />,
            },
        ],
    };
}
