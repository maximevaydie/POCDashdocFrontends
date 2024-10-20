import {TIME_CELL_WIDTH} from "@dashdoc/web-ui/src/scheduler/gridStyles";
import {SiteSlot, parseAndZoneDate} from "dashdoc-utils";
import {differenceInMinutes} from "date-fns";

import {SchedulerActivitiesForCard} from "app/features/scheduler/carrier-scheduler/components/card-content/card-sections/activities/cardActivity.types";
import {TripActivity} from "app/features/trip/trip.types";

function formatActivitiesInTimeline(
    activities: SchedulerActivitiesForCard[],
    cardDateRange: SiteSlot,
    visibleCardDateRange: SiteSlot,
    minutesScale: number
) {
    const cardWidth = getDurationWidth(visibleCardDateRange, minutesScale);

    return activities.reduce(
        (
            result: Array<{
                mergedCount: number;
                activity: SchedulerActivitiesForCard;
                start: string;
                inconsistentDateOrder: boolean;
                inconsistentAskedDate: boolean;
                width: number;
                leftOffset?: number;
            }>,
            activity: SchedulerActivitiesForCard,
            index: number
        ) => {
            let start = getActivityRange(activity, cardDateRange).start;
            let inconsistentAskedDate = isAskedDatesInconsistentWithScheduledDates(activity);

            // If start is outside the visible range of the card, ignore the activity
            if (start < visibleCardDateRange.start || start > visibleCardDateRange.end) {
                return result;
            }

            // If dates are inconsistent with activity order, merge activity with previous one to keep order and display a warning
            if (result.length > 0 && result[result.length - 1].start > start) {
                const previousActivity = result[result.length - 1];
                result[result.length - 1] = {
                    mergedCount: previousActivity.mergedCount + 1,
                    activity,
                    start: previousActivity.start,
                    inconsistentDateOrder: true,
                    inconsistentAskedDate:
                        inconsistentAskedDate || previousActivity.inconsistentAskedDate,
                    width: getActivityWidthPercentageToNextActivity(
                        previousActivity.start,
                        index,
                        activities,
                        visibleCardDateRange
                    ),
                    leftOffset: getActivityWidthPercentage(
                        start,
                        previousActivity.start,
                        visibleCardDateRange
                    ),
                };

                return result;
            }
            // Merge too close activities to avoid activities overlapping
            if (result.length > 0) {
                const previousWidth = result[result.length - 1].width;
                if (isWidthTooSmallToDisplay(previousWidth, cardWidth)) {
                    const previousActivity = result[result.length - 1];
                    result[result.length - 1] = {
                        mergedCount: previousActivity.mergedCount + 1,
                        activity,
                        start: previousActivity.start,
                        inconsistentDateOrder: previousActivity.inconsistentDateOrder,
                        inconsistentAskedDate:
                            inconsistentAskedDate || previousActivity.inconsistentAskedDate,
                        width:
                            previousWidth +
                            getActivityWidthPercentageToNextActivity(
                                start,
                                index,
                                activities,
                                visibleCardDateRange
                            ),
                    };

                    return result;
                }
            }

            result.push({
                mergedCount: 1,
                activity,
                start,
                inconsistentDateOrder: false,
                inconsistentAskedDate,
                width: getActivityWidthPercentageToNextActivity(
                    start,
                    index,
                    activities,
                    visibleCardDateRange
                ),
            });
            return result;
        },
        []
    );
}

function getActivityWidthPercentageToNextActivity(
    startDate: string,
    index: number,
    activities: SchedulerActivitiesForCard[],
    visibleCardDateRange: SiteSlot
) {
    if (index === activities.length - 1) {
        return getActivityWidthPercentage(startDate, null, visibleCardDateRange);
    }
    const nextActivity = activities[index + 1];
    const nextActivityRange = getActivityRange(nextActivity, visibleCardDateRange);
    return getActivityWidthPercentage(startDate, nextActivityRange.start, visibleCardDateRange);
}
function getActivityWidthPercentage(
    startDate: string,
    nextActivityRangeStart: string | null,
    visibleCardDateRange: SiteSlot
) {
    const cardDuration = getDuration(visibleCardDateRange);

    let durationUntilNextActivity;

    if (!nextActivityRangeStart) {
        // if last activity compute duration until the end of the card
        durationUntilNextActivity = differenceInMinutes(
            new Date(visibleCardDateRange.end),
            new Date(startDate)
        );
    } else {
        // otherwise compute duration until next activity start
        // if activity start after the visible range of the card compute duration until the end of the card
        const nextActivityStart =
            nextActivityRangeStart > visibleCardDateRange.end
                ? visibleCardDateRange.end
                : nextActivityRangeStart;

        durationUntilNextActivity =
            nextActivityStart < startDate
                ? 0 // if activity dates are inconsistent consider them to be at the same date -> duration = 0
                : differenceInMinutes(new Date(nextActivityStart), new Date(startDate));
    }

    return cardDuration === 0 ? 0 : (durationUntilNextActivity * 100) / cardDuration;
}
const MINIMUM_SPACE_BETWEEN_ACTIVITIES = 24; // in px
function getActivityWidth(width: number, cardWidth: number) {
    return (width * cardWidth) / 100;
}
function isWidthTooSmallToDisplay(width: number, cardWidth: number) {
    return getActivityWidth(width, cardWidth) <= MINIMUM_SPACE_BETWEEN_ACTIVITIES;
}
function getActivityRange(activity: SchedulerActivitiesForCard, defaultRange: SiteSlot) {
    if (activity.real_start) {
        return {start: activity.real_start, end: activity.real_end ?? activity.real_start};
    }
    if (activity.scheduled_range) {
        return activity.scheduled_range;
    }
    if (activity.slots && activity.slots?.length > 0 && activity.slots[0]) {
        return activity.slots[0];
    }
    return defaultRange;
}
function isAskedDatesInconsistentWithScheduledDates(
    activity: Pick<TripActivity, "slots" | "scheduled_range">
) {
    const askedRange = activity.slots && activity.slots.length > 0 ? activity.slots[0] : null;
    const scheduledRange = activity.scheduled_range;
    const timezone = "Europe/Paris";
    if (!askedRange || !scheduledRange) {
        return false;
    }
    const askedStartDate = parseAndZoneDate(askedRange.start, timezone) as Date;
    const askedEndDate = parseAndZoneDate(askedRange.end, timezone) as Date;
    const scheduledStartDate = parseAndZoneDate(scheduledRange.start, timezone) as Date;
    const scheduledEndDate = parseAndZoneDate(scheduledRange.end, timezone) as Date;
    return askedEndDate < scheduledStartDate || askedStartDate > scheduledEndDate;
}

function getDuration(dateRange: SiteSlot) {
    return differenceInMinutes(new Date(dateRange.end), new Date(dateRange.start));
}
function getDurationWidth(dateRange: SiteSlot, minutesScale: number) {
    return (getDuration(dateRange) * TIME_CELL_WIDTH) / minutesScale;
}

export const activityTimelineService = {
    formatActivitiesInTimeline,
    getDurationWidth,
    isWidthTooSmallToDisplay,
    getActivityWidth,
    isAskedDatesInconsistentWithScheduledDates,
};
