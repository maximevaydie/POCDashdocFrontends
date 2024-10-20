import {useSelector, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {ClickableUpdateRegion, Flex, Icon, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {useToggle, SiteSlot, parseAndZoneDate, formatDate} from "dashdoc-utils";
import {differenceInMinutes} from "date-fns";
import React from "react";

import {activityTimelineService} from "app/features/scheduler/carrier-scheduler/components/card-content/card-sections/activities/timeline/activityTimeline.service";
import {TripActivityScheduledDateEdition} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/trip-details/components/trip-activities/TripActivityScheduledDateEdition";
import {UpdateActivityAskedDatesModal} from "app/features/transport/transport-details/transport-details-activities/UpdateActivityAskedDatesModal";
import {isTripActivityStarted} from "app/features/trip/trip.service";
import {SimilarActivityWithTransportData} from "app/features/trip/trip.types";
import {RootState} from "app/redux/reducers";
import {getTripByUid} from "app/redux/selectors";

export function ScheduledDates({
    tripUid,
    activity,
    editable,
}: {
    tripUid: string;
    activity: SimilarActivityWithTransportData;
    editable: boolean;
}) {
    const timezone = useTimezone();
    const {time, date} = getDateAndTime(activity.scheduled_range, timezone);
    const [isOpen, open, close] = useToggle(false);

    return (
        <>
            <TooltipWrapper
                content={
                    isTripActivityStarted(activity)
                        ? t("trip.scheduledDates.cannotEditStartedActivity")
                        : null
                }
            >
                <ClickableUpdateRegion
                    clickable={editable && !isTripActivityStarted(activity)}
                    onClick={open}
                    data-testid="scheduled-date"
                >
                    <Text variant="captionBold" data-testid="time">
                        {time}
                    </Text>
                    <Text variant="subcaption">{date}</Text>
                </ClickableUpdateRegion>
            </TooltipWrapper>
            {isOpen && (
                <TripActivityScheduledDateEdition
                    tripUid={tripUid}
                    activityUids={
                        activity.similarUids.length > 0 ? activity.similarUids : [activity.uid]
                    }
                    defaultRange={activity.scheduled_range}
                    defaultLockedRequestedTimes={activity.locked_requested_times}
                    askedDateRange={activity.slots?.[0] ?? null}
                    onClose={close}
                />
            )}
        </>
    );
}

export function RealDates({activity}: {activity: SimilarActivityWithTransportData}) {
    const timezone = useTimezone();
    const realDates = activity.real_start
        ? {start: activity.real_start, end: activity.real_end ?? activity.real_start}
        : null;
    const {time, date} = getDateAndTime(realDates, timezone);

    return (
        <Flex flexDirection="column" height="100%" justifyContent="center">
            <Text variant="captionBold">{time}</Text>
            <Text variant="subcaption">{date}</Text>
        </Flex>
    );
}

export function AlertAskedDates({
    activity,
    editable,
    tripUid,
}: {
    activity: SimilarActivityWithTransportData;
    editable: boolean;
    tripUid: string;
}) {
    const [isOpen, open, close] = useToggle(false);
    const timezone = useTimezone();
    const askedRange = activity.slots && activity.slots.length > 0 ? activity.slots[0] : null;
    const {time, date} = getDateAndTime(askedRange, timezone);
    const inconsistentDates =
        activityTimelineService.isAskedDatesInconsistentWithScheduledDates(activity);

    const truckerPk = useSelector((state: RootState) => getTripByUid(state, tripUid)?.trucker?.pk);
    const vehiclePk = useSelector((state: RootState) => getTripByUid(state, tripUid)?.vehicle?.pk);
    const trailerPk = useSelector((state: RootState) => getTripByUid(state, tripUid)?.trailer?.pk);

    return (
        <>
            <ClickableUpdateRegion
                clickable={editable && !isTripActivityStarted(activity)}
                onClick={open}
                data-testid="asked-date"
            >
                <Flex
                    alignItems="center"
                    height="100%"
                    justifyContent="space-between"
                    backgroundColor={inconsistentDates ? "yellow.ultralight" : undefined}
                    borderRadius={1}
                    p={1}
                    m={-1}
                >
                    <Flex flexDirection="column" justifyContent="center">
                        <Text
                            variant="captionBold"
                            color={inconsistentDates ? "yellow.dark" : "grey.default"}
                            data-testid="time"
                        >
                            {time}
                        </Text>
                        <Text
                            variant="subcaption"
                            color={inconsistentDates ? "yellow.dark" : "grey.default"}
                        >
                            {date}
                        </Text>
                    </Flex>
                    {activity.locked_requested_times && date && (
                        <Icon name="lock" color="blue.default" />
                    )}
                </Flex>
            </ClickableUpdateRegion>
            {isOpen && (
                <UpdateActivityAskedDatesModal
                    tripUid={tripUid}
                    activityUid={activity.uid}
                    askedDates={
                        activity.slots && activity.slots.length > 0 ? activity.slots[0] : undefined
                    }
                    isActivityBookingNeeded={activity.is_booking_needed ?? false}
                    isActivityLockedRequestedTimes={activity.locked_requested_times ?? false}
                    onClose={close}
                    truckerPk={truckerPk}
                    vehiclePk={vehiclePk}
                    trailerPk={trailerPk}
                />
            )}
        </>
    );
}
export function AlertAskedDatesOnMergedActivity({
    activity,
}: {
    activity: SimilarActivityWithTransportData;
}) {
    const inconsistentDates =
        activityTimelineService.isAskedDatesInconsistentWithScheduledDates(activity);

    return inconsistentDates ? (
        <Flex
            alignItems="center"
            height="100%"
            justifyContent="space-between"
            backgroundColor={inconsistentDates ? "yellow.ultralight" : undefined}
            borderRadius={1}
            px={1}
            mx={-1}
        >
            <Text variant="captionBold" color={"yellow.dark"}>
                {t("activity.inconsistentAskedDate")}
            </Text>
            {activity.locked_requested_times && activity.slots && activity.slots.length > 0 && (
                <Icon name="lock" color="blue.default" />
            )}
        </Flex>
    ) : null;
}

function getDateAndTime(range: SiteSlot | undefined | null, timezone: string) {
    const start = parseAndZoneDate(range?.start ?? null, timezone);
    const end = parseAndZoneDate(range?.end ?? null, timezone);
    if (!start) {
        return {time: "--", date: ""};
    }
    if (!end || differenceInMinutes(start, end) === 0) {
        return {time: `${formatDate(start, "p")}`, date: formatDate(start, "P")};
    }
    return {
        time: `${formatDate(start, "p")} - ${formatDate(end, "p")}`,
        date: formatDate(start, "P"),
    };
}
