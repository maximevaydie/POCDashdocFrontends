import {t} from "@dashdoc/web-core";
import {IconNames} from "@dashdoc/web-ui";
import {
    getSiteZonedAskedDateTimes,
    getSiteZonedRealDateTimes,
    parseAndZoneDate,
} from "dashdoc-utils";
import {max, min} from "lodash";

import {activityService} from "app/services/transport/activity.service";
import {getScheduledDateRange} from "app/services/transport/transport.service";

import type {Site, Transport, TransportStatus} from "app/types/transport";

/**
 * Asked time and scheduled times define
 * time ranges in which the site's activity
 * can happen.
 */
type TimeRangeDescriptor = {
    name: string | null;
    type: "asked" | "scheduled";
    zonedDateTimeMin: Date | null;
    zonedDateTimeMax: Date | null;
    isDatesInconsistent: boolean;
};

/** Actual time is... actual, there no
 * reason for there to be a range. Also
 * the actual time can be given by the
 * telematic.
 */
type ActualTimeDescriptorBase = {
    name: string;
    type: "actual";
    zonedTime: Date | null;
    zonedTelematicTime: Date | null;
    icon: {
        name: IconNames;
        color: string;
    };
};

interface HourSectionDescriptor {
    "data-testid": string;
    bookingNeeded: boolean;
    lockedRequestedTimes: boolean;
    clickable: boolean;
    collapsable: boolean;
    headerText: string;
    slots: (TimeRangeDescriptor | ActualTimeDescriptorBase)[];
    type: "asked" | "scheduled" | "actual";
    onClick: (() => void) | undefined;
}

interface SiteDatesAndTimesDescriptor {
    hourSectionsToDisplay: HourSectionDescriptor[];
}

type DateMinAndMax = {
    beforeLaterStartDate?: string;
    afterEarlierEndDate?: string;
};
export type DateLimits = {
    asked: DateMinAndMax;
    scheduled: DateMinAndMax;
};
/**
 * Returns a SiteDatesAndTimesDescriptor which contains a list
 * of date/time sections to be displayed.
 */
export function getSiteDatesAndTimes(
    timezone: string,
    site: Site,
    updatesAskedAllowed: boolean,
    updatesScheduledAllowed: boolean,
    updatesRealAllowed: boolean,
    onAskedHoursClick?: () => void,
    onSchedulerHoursClick?: () => void,
    onRealHoursClick?: () => void,
    scheduledStartRange?: {start: string; end: string},
    scheduledEndRange?: {start: string; end: string},
    statuses?: Array<TransportStatus>,
    dateLimits?: {
        asked: {
            beforeLaterStartDate?: string;
            afterEarlierEndDate?: string;
        };
        scheduled: {
            beforeLaterStartDate?: string;
            afterEarlierEndDate?: string;
        };
    }
): SiteDatesAndTimesDescriptor {
    const {zonedStart: zonedAskedStart, zonedEnd: zonedAskedEnd} = getSiteZonedAskedDateTimes(
        site,
        timezone
    );
    const {zonedStart: zonedRealStart, zonedEnd: zonedRealEnd} = getSiteZonedRealDateTimes(
        site,
        timezone
    );

    const {zonedTelematicStartTime, zonedTelematicEndTime} = getTelematicDateTimes(
        site,
        timezone,
        statuses
    );

    const zonedScheduledStartDateRange = scheduledStartRange
        ? {
              start: parseAndZoneDate(scheduledStartRange.start, timezone),
              end: parseAndZoneDate(scheduledStartRange.end, timezone),
          }
        : undefined;

    const zonedScheduledEndDateRange = scheduledEndRange
        ? {
              start: parseAndZoneDate(scheduledEndRange.start, timezone),
              end: parseAndZoneDate(scheduledEndRange.end, timezone),
          }
        : undefined;

    const hasAskedhours = !!(zonedAskedStart || zonedAskedEnd);
    const hasScheduledHours = !!(scheduledStartRange || scheduledEndRange);
    const hasActualHours = !!(zonedRealStart || zonedRealEnd);
    const hasCompleteActualHours = !!(zonedRealStart && zonedRealEnd);

    /* Ok, we are ready to build the object that describes what the component
    should render, regardless of their collapsed state*/
    const hourSectionsToDisplay: HourSectionDescriptor[] = [];

    /* ASKED HOURS */
    if (site.category !== "breaking" && (hasAskedhours || updatesAskedAllowed)) {
        /* Then declare that the Asked Hours section should be shown to the user. */
        // Breaking sites do NOT have asked hours.

        const slots: TimeRangeDescriptor[] = hasAskedhours
            ? [
                  {
                      name: null,
                      zonedDateTimeMin: zonedAskedStart,
                      zonedDateTimeMax: zonedAskedEnd,
                      type: "asked",
                      isDatesInconsistent: isDateInconsistent(
                          zonedAskedEnd,
                          timezone,
                          dateLimits?.asked.beforeLaterStartDate
                      ),
                  },
              ]
            : [];

        hourSectionsToDisplay.push({
            "data-testid": "asked-hours",
            bookingNeeded: (site as Site).is_booking_needed,
            lockedRequestedTimes: (site as Site).locked_requested_times ?? false,
            clickable: updatesAskedAllowed,
            collapsable: !hasAskedhours || hasScheduledHours || hasActualHours || !slots.length,
            headerText: t("components.askedHours"),
            slots,
            type: "asked",
            onClick: onAskedHoursClick,
        });
    }

    /* SCHEDULED HOURS */
    if (hasScheduledHours || updatesScheduledAllowed) {
        const slots: TimeRangeDescriptor[] = [];

        if (hasScheduledHours) {
            if (site.category === "breaking") {
                // Breaking sites have TWO schedulable time ranges:
                // - the time at which the break starts
                // - the time at which the transport resumes
                if (zonedScheduledStartDateRange) {
                    slots.push({
                        name: t("components.break"),
                        zonedDateTimeMin: zonedScheduledStartDateRange.start,
                        zonedDateTimeMax: zonedScheduledStartDateRange.end,
                        type: "scheduled",
                        isDatesInconsistent: isDateInconsistent(
                            zonedScheduledStartDateRange.end,
                            timezone,
                            dateLimits?.scheduled.beforeLaterStartDate
                        ),
                    });
                }
                if (zonedScheduledEndDateRange) {
                    slots.push({
                        name: t("components.resumption"),
                        zonedDateTimeMin: zonedScheduledEndDateRange.start,
                        zonedDateTimeMax: zonedScheduledEndDateRange.end,
                        type: "scheduled",
                        isDatesInconsistent: isDateInconsistent(
                            zonedScheduledEndDateRange.end,
                            timezone,
                            dateLimits?.scheduled.beforeLaterStartDate
                        ),
                    });
                }
            } else {
                // Non-breaking sites only have one time range: the activity at the
                // site is scheduled to happen within that range.
                if (zonedScheduledStartDateRange) {
                    slots.push({
                        name: null,
                        zonedDateTimeMin: zonedScheduledStartDateRange.start,
                        zonedDateTimeMax: zonedScheduledStartDateRange.end,
                        type: "scheduled",
                        isDatesInconsistent: isDateInconsistent(
                            zonedScheduledStartDateRange.end,
                            timezone,
                            dateLimits?.scheduled.beforeLaterStartDate
                        ),
                    });
                }
            }
        }

        hourSectionsToDisplay.push({
            "data-testid": "scheduled-hours",
            bookingNeeded: false,
            lockedRequestedTimes: false,
            clickable:
                site.category !== "breaking"
                    ? updatesScheduledAllowed
                    : // If the site is a breaking site and the actual hours are incomplete then
                      // we allow the editing of the Scheduled hours. Note that here we don't consider
                      // if the break has been started or not. We know it is wanted editable because
                      // we were given `updatesScheduledAllowed`. The responsability of making the user
                      // edit the (scheduled) break time and/or the resuming time is left to the modal.
                      updatesScheduledAllowed && !hasCompleteActualHours,
            collapsable: site.category !== "breaking" ? hasActualHours : hasCompleteActualHours,
            headerText: t("components.plannedHours"),
            slots,
            type: "scheduled",
            onClick: onSchedulerHoursClick,
        });
    }

    /* ACTUAL HOURS */
    if (hasActualHours) {
        /* Then declare that the Actual Hours section should be shown to the user. */

        const slots: ActualTimeDescriptorBase[] = [];
        if (zonedRealStart) {
            slots.push({
                name:
                    site.category === "breaking"
                        ? t("components.break")
                        : t("activityStatus.onSite"),
                zonedTime: zonedRealStart,
                zonedTelematicTime: zonedTelematicStartTime,
                type: "actual",
                icon: {name: "check", color: "green.default"},
            });
        }
        if (zonedRealEnd) {
            slots.push({
                name:
                    site.category === "breaking"
                        ? t("components.resumption")
                        : t("activityStatus.done"),
                zonedTime: zonedRealEnd,
                zonedTelematicTime: zonedTelematicEndTime,
                type: "actual",
                icon: {name: "check", color: "green.default"},
            });
        }

        hourSectionsToDisplay.push({
            "data-testid": "actual-hours",
            bookingNeeded: false,
            lockedRequestedTimes: false,
            clickable: updatesRealAllowed,
            collapsable: false, // Always show actual hours if we have them!
            headerText: t("components.actualHours"),
            slots,
            type: "actual",
            onClick: onRealHoursClick,
        });
    }

    return {
        hourSectionsToDisplay,
    };
}

function getTelematicDateTimes(site: Site, timezone: string, statuses?: Array<TransportStatus>) {
    const telematicStatuses = statuses
        ? statuses.filter((status) => status.creation_method == "telematic")
        : [];
    // For now, we have no way to know if departed statuses are from breaking or resuming site,
    // and so if it corresponds to a start (bulking_break_started) or a end (buliking_break_complete).
    // For best effort, we will assume it is a end only if we have two departed statuses and it is the second one.
    const telematicStatusStart = telematicStatuses.find((status) => {
        const category = status.update_details?.status || status.category;
        return site.category === "breaking"
            ? category === "departed"
            : ["on_loading_site", "on_unloading_site", "rounds_started"].includes(category);
    });

    const zonedTelematicStartTime = parseAndZoneDate(
        telematicStatusStart?.created_device || null,
        timezone
    );

    const telematicDepartedStatuses = telematicStatuses.filter((status) => {
        const category = status.update_details?.status || status.category;
        return category === "departed";
    });

    const telematicStatusEnd = telematicStatuses.find((status) => {
        const category = status.update_details?.status || status.category;
        return site.category === "breaking"
            ? category === "departed" && telematicDepartedStatuses.indexOf(status) === 1
            : category === "departed";
    });

    const zonedTelematicEndTime = parseAndZoneDate(
        telematicStatusEnd?.created_device || null,
        timezone
    );

    return {zonedTelematicStartTime, zonedTelematicEndTime};
}

export function isDateInconsistent(
    endDate: Date | null,
    timezone: string,
    minDateString?: string
) {
    const minDate = minDateString ? parseAndZoneDate(minDateString, timezone) : null;
    return Boolean(endDate && minDate && endDate < minDate);
}

export function getDateLimits(siteUid: string, transport: Transport) {
    const activities = activityService.getTransportActivities(transport);
    const index = activities.findIndex((activity) => activity.site.uid === siteUid);
    const activitiesBefore = activities.slice(0, index);
    const activitiesAfter = activities.slice(index + 1);

    const beforeStartAskedDates = activitiesBefore
        .map((a) => a.site.slots?.[0]?.start ?? undefined)
        .filter((d) => !!d);
    const afterEndAskedAskedDates = activitiesAfter
        .map((a) => a.site.slots?.[0]?.end ?? undefined)
        .filter((d) => !!d);
    const beforeStartScheduledDates = activitiesBefore
        .map((a) => getScheduledDateRange(a)?.start ?? undefined)
        .filter((d) => !!d);
    const afterEndAskedScheduledDates = activitiesAfter
        .map((a) => getScheduledDateRange(a)?.end ?? undefined)
        .filter((d) => !!d);
    return {
        asked: {
            beforeLaterStartDate:
                beforeStartAskedDates.length > 0 ? max(beforeStartAskedDates) : undefined,
            afterEarlierEndDate:
                afterEndAskedAskedDates.length > 0 ? min(afterEndAskedAskedDates) : undefined,
        },
        scheduled: {
            beforeLaterStartDate:
                beforeStartScheduledDates.length > 0 ? max(beforeStartScheduledDates) : undefined,
            afterEarlierEndDate:
                afterEndAskedScheduledDates.length > 0
                    ? min(afterEndAskedScheduledDates)
                    : undefined,
        },
    };
}
