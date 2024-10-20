import {parseAndZoneDate} from "dashdoc-utils";
import {differenceInMinutes, addMinutes} from "date-fns";

import {DaySimulationActivity} from "./day-simulation.types";

function getActivityDuration(activity: DaySimulationActivity, timezone: string): number | null {
    if (activity.real_datetime_range === null) {
        return activity.simulated_duration;
    }

    const activityRealStart = parseAndZoneDate(activity.real_datetime_range.start, timezone);
    const activityRealEnd = parseAndZoneDate(activity.real_datetime_range.end, timezone);

    if (activityRealStart === null || activityRealEnd === null) {
        return null;
    }

    return differenceInMinutes(activityRealEnd, activityRealStart);
}

function getActivityStart(activity: DaySimulationActivity, timezone: string): Date | null {
    return parseAndZoneDate(
        activity.real_datetime_range !== null
            ? activity.real_datetime_range.start
            : activity.simulated_start,
        timezone
    );
}

function getActivityEnd(activity: DaySimulationActivity, timezone: string): Date | null {
    if (activity.real_datetime_range !== null) {
        return parseAndZoneDate(activity.real_datetime_range.end, timezone);
    }

    if (activity.simulated_start === null) {
        return null;
    }

    const activityStart = parseAndZoneDate(activity.simulated_start, timezone);
    if (activityStart === null) {
        return null;
    }

    return addMinutes(activityStart, activity.simulated_duration);
}

export const daySimulationService = {
    getActivityDuration,
    getActivityStart,
    getActivityEnd,
};
