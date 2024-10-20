import {usePrevious} from "dashdoc-utils";
import difference from "lodash.difference";
import {useCallback, useEffect, useMemo} from "react";
import {useDispatch} from "react-redux";

import {SchedulerFilters} from "app/features/scheduler/carrier-scheduler/components/filters/filters.types";
import {
    TripResource,
    TripSchedulerView,
} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {useExtendedView} from "app/hooks/useExtendedView";
import {
    fetchSearchPlannedTrips,
    fetchSearchPlannedTripsByUids,
    resetSearchPlannedTrips,
} from "app/redux/actions/scheduler-trip";

import {cleanPlannedFilterQuery} from "../../components/filters/filters.service";

export function useFetchTrips(
    currentQuery: SchedulerFilters,
    startDate: Date,
    endDate: Date,
    rows: TripResource[]
) {
    /**
     * useState / useRef / others hooks
     **/
    const dispatch = useDispatch();
    const {extendedView} = useExtendedView();

    const rowIds = useMemo(() => (rows ? rows.map((row) => row.pk) : []), [rows]);
    const previousRowsIds = usePrevious(rowIds);
    const additionalRowIds: number[] = useMemo(
        () => (previousRowsIds ? difference(rowIds, previousRowsIds) : rowIds),
        [rowIds, previousRowsIds]
    );

    const plannedTripsQuery = useMemo(() => {
        if (!startDate || !endDate) {
            return null;
        }
        return cleanPlannedFilterQuery(
            {
                view: currentQuery?.view,
                trucker__in: currentQuery?.trucker__in,
                vehicle__in: currentQuery?.vehicle__in,
                trailer__in: currentQuery?.trailer__in,
            },
            startDate,
            endDate,
            extendedView
        );
        // Result depends only from some currentQuery params (view, trucker__in, vehicle__in, trailer__in):
        // No new query should be regenerated if other currentQuery params changed
    }, [
        startDate,
        endDate,
        extendedView,
        currentQuery?.view,
        currentQuery?.trucker__in,
        currentQuery?.vehicle__in,
        currentQuery?.trailer__in,
    ]);

    const fetchAndRedrawTripsInTimeSpan = useCallback(async () => {
        let row_ids = additionalRowIds;
        if (additionalRowIds.length === 0 || additionalRowIds.length === rowIds.length) {
            row_ids = rowIds;
            dispatch(resetSearchPlannedTrips(plannedTripsQuery)); // should merge all data result unless we need to reset research
        }
        if (!plannedTripsQuery || row_ids?.length === 0) {
            return;
        }
        dispatch(
            fetchSearchPlannedTrips(
                plannedTripsQuery,
                row_ids,
                currentQuery?.view as TripSchedulerView
            )
        );

        // - remove additionalRowIds to avoid double call
        // - remove currentQuery?.view dependency from plannedTripsQuery to avoid double calls
        // as rowIds always changes just after view is updated:
        // plannedTripsQuery becomes startDate, endDate
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate, extendedView, rowIds, dispatch]);

    const fetchPlannedTripsByUids = useCallback(
        async (tripsUids: Array<string>) => {
            if (tripsUids.length > 0) {
                dispatch(fetchSearchPlannedTripsByUids(plannedTripsQuery, tripsUids));
            }
        },
        [dispatch, plannedTripsQuery]
    );

    /**
     * useEffect
     **/

    useEffect(() => {
        fetchAndRedrawTripsInTimeSpan();
    }, [fetchAndRedrawTripsInTimeSpan]);

    return {
        fetchAndRedrawTripsInTimeSpan,
        fetchPlannedTripsByUids,
    };
}
