import {FilteringBadge} from "@dashdoc/web-common";
import {FilterData} from "@dashdoc/web-common/src/features/filters/filtering-bar/filtering.types";
import {t} from "@dashdoc/web-core";
import React from "react";

import {DurationOnSiteInput} from "./DurationOnSiteInput";

export function getDurationOnSiteFilter(): FilterData<{
    duration_on_site__gte?: string;
}> {
    return {
        key: "duration-on-site",
        testId: "duration-on-site",
        selector: {
            label: t("filter.durationOnSite"),
            icon: "clock",
            getFilterSelector: (query, updateQuery) => (
                <DurationOnSiteInput query={query} updateQuery={updateQuery} />
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: query.duration_on_site__gte ? 1 : 0,
                badge: (
                    <FilteringBadge
                        label={t("filter.badge.durationOnSite", {
                            duration: query.duration_on_site__gte,
                        })}
                        onDelete={() => updateQuery({duration_on_site__gte: undefined})}
                        data-testid="filter-duration-on-site-badge"
                    />
                ),
            },
        ],
    };
}
