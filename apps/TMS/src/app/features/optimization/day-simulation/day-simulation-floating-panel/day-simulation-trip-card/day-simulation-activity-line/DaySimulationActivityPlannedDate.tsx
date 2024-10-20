import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate} from "dashdoc-utils";
import isSameDay from "date-fns/isSameDay";
import React, {FunctionComponent} from "react";

import {daySimulationService} from "../../../day-simulation.service";
import {DaySimulationActivity, DaySimulationRange} from "../../../day-simulation.types";

interface DaySimulationActivityPlannedDateProps {
    activity: DaySimulationActivity;
    selectedDate: Date;
}

export const DaySimulationActivityPlannedDate: FunctionComponent<
    DaySimulationActivityPlannedDateProps
> = ({activity, selectedDate}) => {
    const timezone = useTimezone();

    let scheduledRange = activity.scheduled_range;
    // if scheduled range is the default value for selected date we ignore it
    if (
        scheduledRange !== null &&
        isDefaultScheduledRangeForSelectedDay(scheduledRange, timezone, selectedDate)
    ) {
        scheduledRange = null;
    }

    if (scheduledRange === null && activity.slots_range === null) {
        return null;
    }

    const hasScheduledDate = scheduledRange !== null;

    const range = hasScheduledDate
        ? (scheduledRange as DaySimulationRange)
        : (activity.slots_range as DaySimulationRange);

    const start = parseAndZoneDate(range.start, timezone);
    const end = parseAndZoneDate(range.end, timezone);

    if (start === null || end === null) {
        return null;
    }

    const DateStr =
        (isSameDay(selectedDate, start) ? "" : formatDate(start, "P").substring(0, 5) + " ") +
        (start.valueOf() === end.valueOf()
            ? formatDate(start, "HH:mm")
            : formatDate(start, "HH:mm") +
              " - " +
              (isSameDay(start, end) ? "" : formatDate(end, "P").substring(0, 5) + " ") +
              formatDate(end, "HH:mm"));

    const activityStart = daySimulationService.getActivityStart(activity, timezone);

    return (
        <Text
            color={activityStart !== null && activityStart > end ? "red.default" : "grey.dark"}
            fontSize={1}
        >
            {t(hasScheduledDate ? "components.plannedHours" : "components.askedHours") +
                " : " +
                DateStr}
        </Text>
    );
};

function isDefaultScheduledRangeForSelectedDay(
    scheduledRange: DaySimulationRange,
    timezone: string,
    selectedDate: Date
): boolean {
    const start = parseAndZoneDate(scheduledRange.start, timezone);
    const end = parseAndZoneDate(scheduledRange.end, timezone);
    if (start === null || end === null) {
        return false;
    }

    return (
        isSameDay(start, end) &&
        start.getHours() === 0 &&
        start.getMinutes() === 0 &&
        end.getHours() === 23 &&
        end.getMinutes() === 59 &&
        isSameDay(start, selectedDate)
    );
}
