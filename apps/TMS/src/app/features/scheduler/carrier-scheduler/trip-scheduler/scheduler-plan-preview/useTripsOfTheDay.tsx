import {useEffect, useMemo} from "react";
import {useDispatch} from "react-redux";

import {cleanPlannedFilterQuery} from "app/features/scheduler/carrier-scheduler/components/filters/filters.service";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {Trip} from "app/features/trip/trip.types";
import {useExtendedView} from "app/hooks/useExtendedView";
import {fetchSearchPlannedTrips} from "app/redux/actions/scheduler-trip";
import {useSelector} from "app/redux/hooks";
import {getPlannedTripsForSpecificQuery} from "app/redux/selectors";

export function useTripsOfTheDays(
    selectedTrip: Trip | null,
    startDate: Date,
    endDate: Date,
    view: TripSchedulerView
) {
    const dispatch = useDispatch();
    const {extendedView} = useExtendedView();
    const resourceUid = selectedTrip?.[view]?.pk;
    const query = useMemo(
        () =>
            cleanPlannedFilterQuery(
                {view, [`${view}__in`]: [resourceUid]},
                startDate,
                endDate,
                extendedView
            ),
        [endDate, extendedView, resourceUid, startDate, view]
    );

    const trips = useSelector((state) => getPlannedTripsForSpecificQuery(state, query));

    useEffect(() => {
        if (!resourceUid) {
            return;
        }
        dispatch(fetchSearchPlannedTrips(query, [resourceUid], view, true));
    }, [dispatch, query, resourceUid, view]);
    return trips;
}
