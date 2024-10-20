import {DatesBadge, FilterData} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import React from "react";

import {FiltersDateTimePeriod} from "app/features/filters/deprecated/FiltersDateTimePeriod";

export type DatetimeRangeRangeQuery = {
    start_date?: string;
    end_date?: string;
};

export function getDatetimeRangeFilter(): FilterData<DatetimeRangeRangeQuery> {
    return {
        key: "datetimeRange",
        testId: "datetime-range",
        selector: {
            label: t("settings.webhookLog.createdFilter"),
            icon: "calendar",
            getFilterSelector: (query, updateQuery) => (
                <Box minHeight="72vh" p={2}>
                    <FiltersDateTimePeriod
                        currentQuery={query}
                        updateQuery={updateQuery}
                        selectionOnly
                    />
                </Box>
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: query["start_date"] || query["end_date"] ? 1 : 0,
                badge: (
                    <DatesBadge<DatetimeRangeRangeQuery>
                        key={`dates-period`}
                        query={query}
                        updateQuery={updateQuery}
                        startDateQueryKey={"start_date"}
                        endDateQueryKey={"end_date"}
                        periodDateBadgeFormat={"yyyy-MM-dd'T'HH:mm"}
                    />
                ),
            },
        ],
    };
}
