import {useTimezone} from "@dashdoc/web-common";
import {getConnectedCompany, getConnectedManager} from "@dashdoc/web-common";
import {AnalyticsEvent, analyticsService, isDateInconsistent} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Callout, DateTimePicker, Flex, Modal, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {
    formatDate,
    SiteSlot,
    parseAndZoneDate,
    zoneDateToISO,
    getSiteZonedAskedDateTimes,
} from "dashdoc-utils";
import {set} from "date-fns";
import React, {useCallback, useMemo, useState} from "react";

import {useActivityDatesConflictWithUnavailability} from "app/features/fleet/unavailabilities/hooks/useConflictWithUnavailability";
import {LockRequestedTimesSwitch} from "app/features/transport/transport-details/transport-details-activities/activity/LockRequestedTimesSwitch";
import {useExtendedView} from "app/hooks/useExtendedView";
import {fetchUpdateSite} from "app/redux/actions";
import {useSelector} from "app/redux/hooks";
import {useDispatch} from "app/redux/hooks";

import type {Activity} from "app/types/transport";

interface UpdateScheduledDateModalProps {
    activity: Activity;
    onClose: () => void;
    beforeLaterStartDate?: string;
    afterEarlierEndDate?: string;
}

function UpdateScheduledDateModal({
    activity,
    onClose,
    beforeLaterStartDate,
    afterEarlierEndDate,
}: UpdateScheduledDateModalProps) {
    const dispatch = useDispatch();
    const timezone = useTimezone();
    const manager = useSelector(getConnectedManager);
    const company = useSelector(getConnectedCompany);
    const {extendedView} = useExtendedView();

    const [lockedRequestedTimes, setLockedRequestedTimes] = useState<boolean>(
        activity.site.locked_requested_times ?? false
    );

    let {
        segment: {
            // @ts-ignore
            scheduled_start_range: currentScheduledStartRange,
            // @ts-ignore
            scheduled_end_range: currentScheduledEndRange,
        },
    } = activity;
    if (
        !currentScheduledStartRange &&
        // @ts-ignore
        (activity as Activity).segment?.origin?.slots?.length > 0
    ) {
        currentScheduledStartRange = (activity as Activity).segment?.origin?.slots[0];
    }
    if (
        !currentScheduledEndRange &&
        // @ts-ignore
        (activity as Activity).segment?.destination?.slots?.length > 0
    ) {
        currentScheduledEndRange = (activity as Activity).segment?.destination?.slots[0];
    }
    if (!currentScheduledEndRange && currentScheduledStartRange) {
        currentScheduledEndRange = currentScheduledStartRange;
    }
    if (!currentScheduledStartRange && currentScheduledEndRange) {
        currentScheduledStartRange = currentScheduledEndRange;
    }

    const dateKeyToUpdate =
        activity.siteType === "origin" ? "scheduled_start_range" : "scheduled_end_range";
    const dateRangeToUpdate =
        dateKeyToUpdate === "scheduled_start_range"
            ? currentScheduledStartRange
            : currentScheduledEndRange;

    const [date, setDate] = useState<Date>(
        parseAndZoneDate(dateRangeToUpdate?.start, timezone) || new Date()
    );
    const [timeMin, setTimeMin] = useState<string>(
        // @ts-ignore
        dateRangeToUpdate
            ? formatDate(parseAndZoneDate(dateRangeToUpdate.start, timezone), "HH:mm")
            : undefined
    );
    const [timeMax, setTimeMax] = useState<string>(
        // @ts-ignore
        dateRangeToUpdate
            ? formatDate(parseAndZoneDate(dateRangeToUpdate.end, timezone), "HH:mm")
            : undefined
    );

    const {startDate, endDate} = useMemo(() => {
        let startDate = date;
        let endDate = date;
        const [startHours = "00", startMinutes = "00"] = timeMin ? timeMin.split(":") : [];
        startDate = set(new Date(date), {
            hours: parseInt(startHours),
            minutes: parseInt(startMinutes),
        });
        const [endHours = "23", endMinutes = "59"] = timeMax ? timeMax.split(":") : [];
        endDate = set(new Date(date), {
            hours: parseInt(endHours),
            minutes: parseInt(endMinutes),
        });
        return {startDate, endDate};
    }, [date, timeMin, timeMax]);

    const isInconsistent = isDateInconsistent(
        startDate,
        endDate,
        timezone,
        beforeLaterStartDate,
        afterEarlierEndDate
    );

    const [isLoading, setIsloading] = useState(false);

    const {
        hasTruckerAvailabilityConflict,
        hasVehicleAvailabilityConflict,
        hasTrailerAvailabilityConflict,
    } = useActivityDatesConflictWithUnavailability({
        tripUid: activity.site.trip?.uid as string,
        activityUid: activity.site.uid,
        truckerPk: activity.segment?.trucker?.pk,
        vehiclePk: activity.segment?.vehicle?.original ?? activity.segment?.vehicle?.pk,
        trailerPk:
            activity.segment?.trailers?.[0]?.original ?? activity.segment?.trailers?.[0]?.pk,
        startDate,
        endDate,
        dateType: "scheduled",
    });

    const handleTimeChange = (time: {min?: string; max?: string}) => {
        if (time.min !== undefined) {
            setTimeMin(time.min);
        }
        if (time.max !== undefined) {
            setTimeMax(time.max);
        }
        setLockedRequestedTimes(false);
    };

    const onSave = useCallback(() => {
        setIsloading(true);
        if (activity.previousSegment) {
            analyticsService.sendEvent(AnalyticsEvent.plannedHoursEdited, {
                "company id": company?.pk,
                "segment uid": activity.previousSegment.uid,
                "transport uid": activity.transportUid,
            });
        }
        if (activity.nextSegment) {
            analyticsService.sendEvent(AnalyticsEvent.plannedHoursEdited, {
                "company id": company?.pk,
                "segment uid": activity.nextSegment.uid,
                "transport uid": activity.transportUid,
            });
        }

        const payload = {
            scheduled_range: {
                start: zoneDateToISO(startDate, timezone),
                end: zoneDateToISO(endDate, timezone),
            } as SiteSlot,
            extended_view: extendedView,
            locked_requested_times: lockedRequestedTimes,
        };
        // @ts-ignore
        dispatch(fetchUpdateSite(activity.site.uid, payload)).then(() => {
            setIsloading(false);
            onClose();
        });
    }, [
        dispatch,
        activity,
        onClose,
        startDate,
        endDate,
        timezone,
        manager,
        company,
        extendedView,
    ]);

    return (
        <Modal
            title={t("components.plannedHourModification")}
            onClose={onClose}
            id="update-scheduled-date-modal"
            mainButton={{
                children: t("common.save"),
                onClick: onSave,
                loading: isLoading,
                "data-testid": "scheduled-hours-save-button",
            }}
        >
            <DateTimePicker
                date={date}
                timeMin={timeMin}
                timeMax={timeMax}
                onDateChange={setDate}
                onTimeChange={handleTimeChange}
                rootId="react-app-modal-root"
            />
            {activity.site.slots?.length > 0 && (
                <LockRequestedTimesSwitch
                    value={lockedRequestedTimes}
                    onChange={onChangeLockedRequestedTimes}
                />
            )}

            {isInconsistent && (
                <Callout mt={2} variant="warning" data-testid="inconsistent-date-warning">
                    <Flex justifyContent="space-between">
                        {t("activity.inconsistentDates")}
                        <TooltipWrapper content={t("activity.inconsistentDatesExplanation")}>
                            <Text color="blue.default">{t("common.learnMore")}</Text>
                        </TooltipWrapper>
                    </Flex>
                </Callout>
            )}

            {hasTruckerAvailabilityConflict && (
                <Callout mt={2} variant="warning" data-testid="conflict-date-availability-trucker">
                    <Text>{t("unavailability.conflictTruckerUnavailable")}</Text>
                </Callout>
            )}
            {hasVehicleAvailabilityConflict && (
                <Callout mt={2} variant="warning" data-testid="conflict-date-availability-vehicle">
                    <Text>{t("unavailability.conflictVehicleUnavailable")}</Text>
                </Callout>
            )}
            {hasTrailerAvailabilityConflict && (
                <Callout mt={2} variant="warning" data-testid="conflict-date-availability-trailer">
                    <Text>{t("unavailability.conflictTrailerUnavailable")}</Text>
                </Callout>
            )}
        </Modal>
    );

    function onChangeLockedRequestedTimes(value: boolean) {
        setLockedRequestedTimes(value);
        if (value && activity.site.slots.length > 0) {
            const {zonedStart: zonedAskedStart, zonedEnd: zonedAskedEnd} =
                getSiteZonedAskedDateTimes(activity.site, timezone);
            if (zonedAskedStart && zonedAskedEnd) {
                setTimeMin(formatDate(zonedAskedStart, "HH:mm"));
                setTimeMax(formatDate(zonedAskedEnd, "HH:mm"));
            }
        }
    }
}

export default UpdateScheduledDateModal;
