import {zoneDateToISO, parseAndZoneDate} from "dashdoc-utils";
import {addSeconds, addMinutes, differenceInMinutes} from "date-fns";

import {CompactTrip, Trip, TripActivity} from "app/features/trip/trip.types";

function hasMissingScheduledDates(trip: Trip | CompactTrip) {
    return trip.activities.some(
        (activity) => !activity.scheduled_range || !activity.scheduled_range.start
    );
}

function formatDateRangeToISO(range: {start: Date; end: Date}, timezone: string) {
    return {
        start: zoneDateToISO(range.start, timezone),
        end: zoneDateToISO(range.end, timezone),
    };
}

function computeTripDateRangeAccordingDrivingTime(trip: Trip | CompactTrip, previewDate: Date) {
    const durationInSeconds =
        // get estimated driving time or consider 2 driving hours between activities
        (trip?.estimated_driving_time ?? 2 * 60 * 60 * (trip.activities.length - 1)) +
        // and add 30min of handling per activity
        trip.activities.length * 30 * 60;
    const endDate = addSeconds(new Date(previewDate), durationInSeconds);

    return {
        start: previewDate,
        end: endDate,
    };
}
function computeTripActivitiesDatesAccordingDrivingTime(
    trip: Trip,
    timezone: string,
    previewDate: Date
) {
    const activities = trip.activities.reduce(
        (result: {activities: TripActivity[]; nextDate: Date}, activity) => {
            const rangeStartDate = new Date(result.nextDate);
            const rangeEndDate = addMinutes(new Date(rangeStartDate), 30);
            const scheduled_range = {
                start: zoneDateToISO(rangeStartDate, timezone),
                end: zoneDateToISO(rangeEndDate, timezone),
            };
            result.activities.push({...activity, scheduled_range});
            result.nextDate = addSeconds(
                rangeEndDate,
                activity.estimated_driving_time_to_next_trip_activity ?? 2 * 60 * 60
            );
            return result;
        },
        {activities: [], nextDate: previewDate}
    ).activities;

    return activities;
}
function computeTripScheduledDatesDataAccordingDrivingTime(
    trip: Trip,
    timezone: string,
    previewDate: Date
) {
    return {
        activities: computeTripActivitiesDatesAccordingDrivingTime(trip, timezone, previewDate),
        scheduler_datetime_range: formatDateRangeToISO(
            computeTripDateRangeAccordingDrivingTime(trip, previewDate),
            timezone
        ),
    };
}

function getShiftTime(trip: Trip | CompactTrip, timezone: string, previewDate: Date) {
    return differenceInMinutes(
        previewDate,
        parseAndZoneDate(trip.scheduler_datetime_range.start, timezone) as Date
    );
}
function shiftTripDateRange(
    trip: Trip | CompactTrip,
    timezone: string,
    previewDate: Date,
    shiftTimeInMinutes: number
) {
    const tripEndDate = addMinutes(
        parseAndZoneDate(trip.scheduler_datetime_range.end as string, timezone) as Date,
        shiftTimeInMinutes
    );
    return {
        start: previewDate,
        end: tripEndDate,
    };
}
function shiftTripActivitiesScheduledDates(
    trip: Trip,
    timezone: string,
    shiftTimeInMinutes: number
) {
    return trip.activities.map((activity) => {
        const rangeStartDate = addMinutes(
            parseAndZoneDate(activity.scheduled_range?.start as string, timezone) as Date,
            shiftTimeInMinutes
        );
        const rangeEndDate = addMinutes(
            parseAndZoneDate(activity.scheduled_range?.end as string, timezone) as Date,
            shiftTimeInMinutes
        );
        const scheduledRange = {
            start: zoneDateToISO(rangeStartDate, timezone),
            end: zoneDateToISO(rangeEndDate, timezone),
        };
        return {...activity, scheduled_range: scheduledRange};
    });
}
function shiftTripScheduledDatesData(trip: Trip, timezone: string, previewDate: Date) {
    const shiftTimeInMinutes = getShiftTime(trip, timezone, previewDate);

    return {
        activities: shiftTripActivitiesScheduledDates(trip, timezone, shiftTimeInMinutes),
        scheduler_datetime_range: formatDateRangeToISO(
            shiftTripDateRange(trip, timezone, previewDate, shiftTimeInMinutes),
            timezone
        ),
    };
}

function computeTripScheduledDatesData(trip: Trip, timezone: string, previewDate: Date) {
    if (hasMissingScheduledDates(trip)) {
        return computeTripScheduledDatesDataAccordingDrivingTime(trip, timezone, previewDate);
    } else {
        return shiftTripScheduledDatesData(trip, timezone, previewDate);
    }
}
function computeTripScheduledRange(trip: Trip | CompactTrip, timezone: string, previewDate: Date) {
    if (hasMissingScheduledDates(trip)) {
        return computeTripDateRangeAccordingDrivingTime(trip, previewDate);
    } else {
        const shiftTimeInMinutes = getShiftTime(trip, timezone, previewDate);
        return shiftTripDateRange(trip, timezone, previewDate, shiftTimeInMinutes);
    }
}

function getDefaultPreviewRangeDate(trip: Trip | CompactTrip, timezone: string) {
    // Use trip start date
    let tripStartDate = trip?.scheduler_datetime_range?.start
        ? parseAndZoneDate(trip.scheduler_datetime_range.start, timezone)
        : null;
    let tripEndDate = trip?.scheduler_datetime_range?.end
        ? parseAndZoneDate(trip.scheduler_datetime_range.end, timezone)
        : tripStartDate;
    // Unless if this is a asked or scheduled date is in the past, then use now date
    if (trip?.activities.every((a) => !a.real_start)) {
        const now = parseAndZoneDate(new Date(), timezone);
        if (!tripStartDate || tripStartDate < now) {
            tripStartDate = now;
            return computeTripScheduledRange(trip, timezone, tripStartDate);
        }
    }
    return {start: tripStartDate, end: tripEndDate};
}

export const schedulerPlanPreviewService = {
    computeTripScheduledDatesData,
    computeTripScheduledRange,
    getDefaultPreviewRangeDate,
};
