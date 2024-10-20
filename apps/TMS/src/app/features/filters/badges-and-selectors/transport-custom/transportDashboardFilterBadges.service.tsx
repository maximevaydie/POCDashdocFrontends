import {FilterData, FilteringBadge} from "@dashdoc/web-common";
import {TranslationKeys, t} from "@dashdoc/web-core";
import {formatNumber} from "dashdoc-utils";
import React from "react";

import {
    TransportDelayAndDurationDashboardQuery,
    TransportProgressDashboardQuery,
    TransportPunctualityDashboardQuery,
} from "app/features/filters/badges-and-selectors/transport-custom/transportFilter.types";

export function getTransportDashboardFilterBadges(): FilterData<
    TransportDelayAndDurationDashboardQuery &
        TransportPunctualityDashboardQuery &
        TransportProgressDashboardQuery
> {
    return {
        key: "transport-dashboard",
        testId: "transport-dashboard",
        selector: null,
        getBadges: (query, updateQuery) => [
            ...delayAndDurationBadges.map(({queryKey, getLabel}) => ({
                count:
                    query[queryKey] !== null &&
                    query[queryKey] !== undefined &&
                    !!parseInt(query[queryKey] as string)
                        ? 1
                        : 0,
                badge: (
                    <FilteringBadge
                        label={getLabel(query[queryKey] as string | null)}
                        onDelete={() =>
                            updateQuery({
                                [queryKey]: null,
                            })
                        }
                    />
                ),
            })),
            ...punctualityBadges.map(({queryKey, getLabel, testId}) => ({
                count: query[queryKey] === "0" ? 1 : 0,
                badge: (
                    <FilteringBadge
                        label={getLabel()}
                        onDelete={() =>
                            updateQuery({
                                [queryKey]: null,
                            })
                        }
                        data-testid={testId}
                    />
                ),
            })),
            ...progressBadges.map(({queryKey, getLabel}) => ({
                count: query[queryKey] !== null && query[queryKey] !== undefined ? 1 : 0,
                badge: (
                    <FilteringBadge
                        label={getLabel(query[queryKey])}
                        onDelete={() =>
                            updateQuery({
                                [queryKey]: null,
                            })
                        }
                    />
                ),
            })),
        ],
    };
}

const progressBadges: Array<{
    queryKey: keyof TransportProgressDashboardQuery;
    getLabel: (value: boolean | null | undefined) => string;
}> = [
    {
        queryKey: "cancelled",
        getLabel: () => t("dashboard.transports.cancelled", {smart_count: 2}, {capitalize: true}),
    },
    {
        queryKey: "is_done",
        getLabel: (value) =>
            value
                ? t("dashboard.transports.with_a_done_delivery")
                : t("dashboard.transports.with_a_delivery_not_done"),
    },
];

const punctualityBadges: Array<{
    queryKey: keyof TransportPunctualityDashboardQuery;
    getLabel: () => string;
    testId: string;
}> = [
    {
        queryKey: "origin_arrival_delay",
        getLabel: () => t("dashboard.transports.ontime_at_loading"),
        testId: "filters-badges-ontime-at-unloading",
    },
    {
        queryKey: "destination_arrival_delay",
        getLabel: () => t("dashboard.transports.ontime_at_unloading"),
        testId: "filters-badges-ontime-at-unloading",
    },
    {
        queryKey: "origin_arrival_delay__gt",
        getLabel: () => t("dashboard.transports.delayed_at_loading"),
        testId: "filters-badges-delayed-at-loading",
    },
    {
        queryKey: "destination_arrival_delay__gt",
        getLabel: () => t("dashboard.transports.delayed_at_unloading"),
        testId: "filters-badges-delayed-at-unloading",
    },
];

const delayAndDurationBadges: Array<{
    queryKey: keyof TransportDelayAndDurationDashboardQuery;
    getLabel: (value: string | null | undefined) => string;
}> = [
    // Badges for filters from distribution of loading / unloading durations bar chart
    "loading_duration__gt" as keyof TransportDelayAndDurationDashboardQuery,
    "loading_duration__lte" as keyof TransportDelayAndDurationDashboardQuery,
    "unloading_duration__gt" as keyof TransportDelayAndDurationDashboardQuery,
    "unloading_duration__lte" as keyof TransportDelayAndDurationDashboardQuery,
    // Badges for filters from distribution of delays bar chart
    "origin_arrival_delay__gt" as keyof TransportDelayAndDurationDashboardQuery,
    "origin_arrival_delay__lte" as keyof TransportDelayAndDurationDashboardQuery,
    "destination_arrival_delay__gt" as keyof TransportDelayAndDurationDashboardQuery,
    "destination_arrival_delay__lte" as keyof TransportDelayAndDurationDashboardQuery,
].map((filter) => ({
    queryKey: filter,
    getLabel: (value: string | null) =>
        t(timeFilterToTranslationKey(filter), {
            // convert seconds into minutes
            n: formatNumber(parseInt(value as string) / 60),
        }),
}));

function timeFilterToTranslationKey(
    filterName: keyof TransportDelayAndDurationDashboardQuery
): TranslationKeys {
    switch (filterName) {
        case "origin_arrival_delay__gt":
            return "dashboard.transports.with_origin_arrival_delay__gt";
        case "origin_arrival_delay__lte":
            return "dashboard.transports.with_origin_arrival_delay__lte";
        case "destination_arrival_delay__gt":
            return "dashboard.transports.with_destination_arrival_delay__gt";
        case "destination_arrival_delay__lte":
            return "dashboard.transports.with_destination_arrival_delay__lte";
        case "loading_duration__gt":
            return "dashboard.transports.with_loading_duration__gt";
        case "loading_duration__lte":
            return "dashboard.transports.with_loading_duration__lte";
        case "unloading_duration__gt":
            return "dashboard.transports.with_unloading_duration__gt";
        case "unloading_duration__lte":
            return "dashboard.transports.with_unloading_duration__lte";
    }
    return "filter.condition";
}
