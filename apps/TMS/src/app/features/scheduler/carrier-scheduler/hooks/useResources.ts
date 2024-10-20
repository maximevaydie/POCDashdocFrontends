import {usePaginatedFetch} from "@dashdoc/web-common/src/hooks/usePaginatedFetch";
import {useCallback} from "react";

import {SchedulerFilters} from "app/features/scheduler/carrier-scheduler/components/filters/filters.types";
import {TripResource} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {useExtendedView} from "app/hooks/useExtendedView";

export function useResources(schedulerResourceQuery: SchedulerFilters) {
    const {extendedView} = useExtendedView();
    const {rowsUrl, rowsQueryParams} = getRowsUrlAndParams(schedulerResourceQuery, extendedView);
    const {
        items: rows,
        loadNext: onEndReached,
        isLoading: isLoadingRows,
        hasNext: hasNextRows,
        totalCount,
        reload,
    } = usePaginatedFetch<TripResource>(rowsUrl, rowsQueryParams);

    const onResourceEndReached = useCallback(() => {
        if (hasNextRows && !isLoadingRows) {
            onEndReached();
        }
    }, [hasNextRows, isLoadingRows, onEndReached]);

    return {
        rows,
        totalCount,
        reload,
        onResourceEndReached,
    };
}

function getRowsUrlAndParams(currentQuery: SchedulerFilters, extendedView: boolean) {
    let rowsUrl = "";
    let rowsQueryParams: Record<string, string[] | string | boolean | undefined> = {};
    if (currentQuery.view === "trucker") {
        rowsUrl = "/scheduler/truckers/";
        rowsQueryParams = {
            extended_view: extendedView,
            id__in: currentQuery.trucker__in,
            tags__in: currentQuery.fleet_tags__in,
            ordering:
                currentQuery.ordering_truckers === "-user"
                    ? "-user__last_name,-user__first_name,-pk"
                    : "user__last_name,user__first_name,pk",
        };
    } else if (currentQuery.view === "vehicle") {
        rowsUrl = "/scheduler/vehicles/";
        rowsQueryParams = {
            extended_view: extendedView,
            id__in: currentQuery.vehicle__in,
            tags__in: currentQuery.fleet_tags__in,
            ordering: currentQuery.ordering_vehicles || "license_plate",
        };
    } else if (currentQuery.view === "trailer") {
        rowsUrl = "/scheduler/trailers/";
        rowsQueryParams = {
            extended_view: extendedView,
            id__in: currentQuery.trailer__in,
            tags__in: currentQuery.fleet_tags__in,
            ordering: currentQuery.ordering_trailers || "license_plate",
        };
    }

    rowsQueryParams["custom_id_order"] = currentQuery.custom_id_order;

    return {rowsUrl, rowsQueryParams};
}
