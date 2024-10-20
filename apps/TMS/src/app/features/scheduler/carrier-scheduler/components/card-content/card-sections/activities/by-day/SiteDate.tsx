import {useTimezone} from "@dashdoc/web-common";
import {Box} from "@dashdoc/web-ui";
import {DeprecatedIcon} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate, SiteSlot} from "dashdoc-utils";
import {max as maxDate} from "date-fns";
import isSameDay from "date-fns/isSameDay";
import {max, min} from "lodash";
import React from "react";

import EtaTracking from "app/features/transport/eta/eta-tracking/eta-tracking";

import {SchedulerCardActivity} from "../cardActivity.types";

import type {Site} from "app/types/transport";

/**
 * Display the scheduled start of the segment and an icon denoting its status.
 */
export function SiteDate({
    activity,
    cardDateRange,
    schedulerStartDate,
    schedulerEndDate,
    inconsistentOrder,
}: {
    activity: SchedulerCardActivity;
    cardDateRange: SiteSlot;
    schedulerStartDate?: Date;
    schedulerEndDate?: Date;
    inconsistentOrder?: boolean;
}) {
    const timezone = useTimezone();
    const {start, end} = getActivityDatesDisplay(activity, timezone);
    let time;
    if (
        activity.eta &&
        activity.punctuality_status &&
        ["probably_late", "probably_on_time"].includes(activity.punctuality_status)
    ) {
        time = <EtaTracking site={activity as Site} format="short" />;
    } else {
        time = getTimeSlotDisplay({start, end});
    }
    const cardStartDate = schedulerStartDate
        ? maxDate([parseAndZoneDate(cardDateRange.start, timezone) as Date, schedulerStartDate])
        : (parseAndZoneDate(cardDateRange.start, timezone) as Date);
    const continuationLeft = schedulerStartDate && start < schedulerStartDate;
    const continuationRight = schedulerEndDate && end > schedulerEndDate;
    return (
        <Box as="span" color={inconsistentOrder ? "red.default" : undefined}>
            <b>
                {continuationLeft ? (
                    <>
                        <DeprecatedIcon name="long-arrow-alt-left" />
                    </>
                ) : null}
                {continuationRight ? (
                    <>
                        <DeprecatedIcon name="long-arrow-alt-right" />
                    </>
                ) : null}
                {!isSameDay(start, cardStartDate) && formatDate(start, "P").substring(0, 5) + " "}
                {!continuationLeft && !continuationRight && time}
            </b>
        </Box>
    );
}

export function getActivityDatesDisplay(
    activity: Pick<SchedulerCardActivity, "real_start" | "real_end" | "scheduled_range" | "slots">,
    timezone: string
): {start: Date; end: Date} {
    let startDate;
    let endDate;
    if (activity.real_start) {
        startDate = parseAndZoneDate(activity.real_start, timezone);
    } else if (activity.scheduled_range?.start) {
        startDate = parseAndZoneDate(activity.scheduled_range.start, timezone);
    } else if (activity.slots && activity.slots?.length > 0) {
        startDate = parseAndZoneDate(min(activity.slots.map((s) => s.start)) as string, timezone);
    }
    if (activity.real_end) {
        endDate = parseAndZoneDate(activity.real_end, timezone);
    } else if (activity.scheduled_range?.end) {
        endDate = parseAndZoneDate(activity.scheduled_range.end, timezone);
    } else if (activity.slots && activity.slots?.length > 0) {
        endDate = parseAndZoneDate(max(activity.slots.map((s) => s.end)) as string, timezone);
    }
    // @ts-ignore
    return {start: startDate, end: endDate};
}

function getTimeSlotDisplay(range: {start: Date; end: Date}) {
    if (!range || !range.start || !range.end) {
        return "--:--";
    }
    if (range.start.valueOf() === range.end.valueOf()) {
        return formatDate(range.start, "HH:mm");
    }
    return formatDate(range.start, "HH:mm") + " - " + formatDate(range.end, "HH:mm");
}
