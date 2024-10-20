import {useTimezone} from "@dashdoc/web-common";
import {SchedulerCard} from "@dashdoc/web-ui";
import {SchedulerCardSettingsData, parseAndZoneDate} from "dashdoc-utils";
import isEqual from "lodash.isequal";

import {CardLineHeight} from "app/features/scheduler/carrier-scheduler/components/card-content/cardLineHeights.constants";
import {useSchedulerCardSettings} from "app/features/scheduler/carrier-scheduler/hooks/useSchedulerCardSettings";
import {getTripResourceUid} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.service";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {getTripTags} from "app/features/trip/trip.service";
import {CompactTrip} from "app/features/trip/trip.types";
import {useSelector} from "app/redux/hooks";
import {getPlannedTripsForCurrentQuery} from "app/redux/selectors";

export function useTripCards(view: TripSchedulerView): SchedulerCard[] {
    const timezone = useTimezone();
    const schedulerCardSettings = useSchedulerCardSettings();
    const tripCards: SchedulerCard[] = useSelector(
        (state) => {
            const trips = getPlannedTripsForCurrentQuery(state);
            return trips.map((trip) =>
                formatTripAsCard(trip, view, timezone, true, schedulerCardSettings)
            ) as SchedulerCard[];
        },
        (prev, next) => {
            let equals = false;
            if (prev && next && prev?.length === next?.length) {
                const sortedPrev = [...prev].sort((l, r) => l.itemUid.localeCompare(r.itemUid));
                const sortedNext = [...next].sort((l, r) => l.itemUid.localeCompare(r.itemUid));
                equals = isEqual(sortedPrev, sortedNext);
            }
            return equals;
        }
    );

    return tripCards;
}

export function formatTripAsCard(
    trip: CompactTrip,
    view: TripSchedulerView,
    timezone: string,
    draggable: boolean,
    schedulerCardSettings?: SchedulerCardSettingsData
) {
    return {
        type: "trip",
        itemUid: trip.uid,
        startDate: parseAndZoneDate(trip.scheduler_datetime_range.start, timezone) as Date,
        endDate: parseAndZoneDate(trip.scheduler_datetime_range.end, timezone) as Date,
        resourceUid: getTripResourceUid(trip, view),
        sortOrder: trip.scheduled_order,
        height: schedulerCardSettings ? getCardHeight(schedulerCardSettings, trip) : undefined,
        draggable: draggable,
        resizable: trip.status === "unstarted",
        defaultSort: `1_${trip.created}`,
    } as SchedulerCard;
}

export function getCardHeight(
    schedulerCardSettings: SchedulerCardSettingsData,
    trip?: CompactTrip
) {
    const {
        display_shipper_name,
        display_activities,
        display_means,
        display_vehicle_requested,
        display_global_instructions,
        activity_list_mode,
        display_tags,
        display_tag_text,
    } = schedulerCardSettings;

    const has_tags = trip && getTripTags(trip).length > 0;

    let height = 6;
    if (display_shipper_name) {
        height += CardLineHeight.shipper;
    }
    if (display_activities) {
        if (activity_list_mode == "expand" || !trip || trip.activities.length <= 2) {
            height += CardLineHeight.activity * (trip ? trip.activities.length : 2);
        } else {
            height += CardLineHeight.activity * 3;
        }
    }
    const show_vehicle_requested =
        display_vehicle_requested &&
        (!trip ||
            trip.activities.some((activity) =>
                activity.transports.some((t) => t.requested_vehicle)
            ));
    const show_instructions =
        display_global_instructions &&
        (!trip ||
            trip.activities.some((activity) => activity.transports.some((t) => !!t.instructions)));
    if (
        display_activities &&
        (display_means || show_vehicle_requested || show_instructions || display_tags)
    ) {
        height += CardLineHeight.spaceAfterActivities;
    }
    if (display_means) {
        height += CardLineHeight.means;
    }
    if (show_vehicle_requested) {
        height += CardLineHeight.vehicleRequested;
    }
    if (show_instructions) {
        height += CardLineHeight.instructions;
    }

    if (has_tags && display_tags) {
        if (display_tag_text) {
            height += CardLineHeight.tagsWithText;
        } else {
            height += CardLineHeight.tagsWithoutText;
        }
    }

    return Math.max(30, height);
}
