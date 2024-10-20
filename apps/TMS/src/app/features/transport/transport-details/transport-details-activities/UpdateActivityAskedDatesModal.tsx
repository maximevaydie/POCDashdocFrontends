import {useTimezone, useFeatureFlag} from "@dashdoc/web-common";
import {isDateInconsistent} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    DateTimePicker,
    Flex,
    Icon,
    Modal,
    SwitchInput,
    TooltipWrapper,
    Text,
} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate, zoneDateToISO, SiteSlot} from "dashdoc-utils";
import {set} from "date-fns";
import React, {useMemo, useState} from "react";
import {useDispatch} from "react-redux";

import {useActivityDatesConflictWithUnavailability} from "app/features/fleet/unavailabilities/hooks/useConflictWithUnavailability";
import {LockRequestedTimesSwitch} from "app/features/transport/transport-details/transport-details-activities/activity/LockRequestedTimesSwitch";
import {useExtendedView} from "app/hooks/useExtendedView";
import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";
import {fetchUpdateSite} from "app/redux/actions";

import {InconsistentDatesCallout} from "../../dates/InconsistentDatesCallout";

interface Props {
    tripUid: string;
    activityUid: string;
    askedDates: SiteSlot | undefined;
    isActivityBookingNeeded: boolean;
    isActivityLockedRequestedTimes: boolean;
    onClose: () => void;
    beforeLaterStartDate?: string;
    afterEarlierEndDate?: string;
    truckerPk: number | undefined;
    vehiclePk: number | undefined;
    trailerPk: number | undefined;
}

export const UpdateActivityAskedDatesModal = ({
    tripUid,
    activityUid,
    askedDates,
    isActivityBookingNeeded,
    isActivityLockedRequestedTimes,
    beforeLaterStartDate,
    afterEarlierEndDate,
    truckerPk,
    vehiclePk,
    trailerPk,
    onClose,
}: Props) => {
    const timezone = useTimezone();
    const minDate = beforeLaterStartDate ? parseAndZoneDate(beforeLaterStartDate, timezone) : null;
    const maxDate = afterEarlierEndDate ? parseAndZoneDate(afterEarlierEndDate, timezone) : null;
    const hasSchedulerByTimeUseAskedDatesEnabled = useFeatureFlag("schedulerByTimeUseAskedDates");
    const hasSchedulerByTimeEnabled = useSchedulerByTimeEnabled();

    const {extendedView} = useExtendedView();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [isBookingNeeded, setBookingNeeded] = useState<boolean>(isActivityBookingNeeded);
    const [lockedRequestedTimes, setLockedRequestedTimes] = useState<boolean>(
        isActivityLockedRequestedTimes
    );
    const [arrivalDateAndTime, setArrivalDateAndTime] = useState<{
        arrival_date: Date;
        arrival_time_min?: string;
        arrival_time_max?: string;
    }>(() => {
        const activityDateAndTimes = _getActivityAskedDateAndTimes(askedDates, timezone);
        return {
            ...activityDateAndTimes,
            arrival_date: _getArrivalDate(activityDateAndTimes.arrival_date, minDate, maxDate),
        };
    });
    const {arrival_date, arrival_time_min, arrival_time_max} = arrivalDateAndTime;
    const {startDate, endDate} = useMemo(() => {
        const [startHours = "00", startMinutes = "00"] = arrival_time_min
            ? arrival_time_min.split(":")
            : [];
        const startDate = set(new Date(arrival_date), {
            hours: parseInt(startHours),
            minutes: parseInt(startMinutes),
        });
        const [endHours = "23", endMinutes = "59"] = arrival_time_max
            ? arrival_time_max.split(":")
            : [];
        const endDate = set(new Date(arrival_date), {
            hours: parseInt(endHours),
            minutes: parseInt(endMinutes),
        });
        return {startDate, endDate};
    }, [arrival_time_min, arrival_time_max, arrival_date]);

    const isInconsistent = isDateInconsistent(
        startDate,
        endDate,
        timezone,
        beforeLaterStartDate,
        afterEarlierEndDate
    );

    const {
        hasTruckerAvailabilityConflict,
        hasVehicleAvailabilityConflict,
        hasTrailerAvailabilityConflict,
    } = useActivityDatesConflictWithUnavailability({
        tripUid: tripUid,
        activityUid: activityUid,
        truckerPk,
        vehiclePk,
        trailerPk,
        startDate,
        endDate,
        dateType: "requested",
    });

    return (
        <Modal
            title={t("components.askedHoursModification")}
            id="update-site-arrival-date-modal"
            data-testid="update-site-arrival-date-modal"
            onClose={onClose}
            mainButton={{
                children: t("common.save"),
                type: "button",
                disabled: loading,
                loading: loading,
                "data-testid": "asked-hours-save-button",
                onClick: handleSubmit,
            }}
            secondaryButton={{
                children: t("common.cancel"),
                disabled: loading,
            }}
        >
            <DateTimePicker
                date={arrival_date}
                timeMin={arrival_time_min}
                timeMax={arrival_time_max}
                required
                onDateChange={handleDateChange}
                onTimeChange={handleArrivalTimeChange}
                rootId="react-app-modal-root"
            />
            <LockRequestedTimesSwitch
                value={lockedRequestedTimes}
                onChange={setLockedRequestedTimes}
            />

            <Box mt={3}>
                <Text variant="h1" mb={3}>
                    {t("common.options")}
                </Text>
                <SwitchInput
                    value={isBookingNeeded}
                    onChange={(value) => {
                        setBookingNeeded(value);
                    }}
                    labelRight={
                        <Flex alignItems="center">
                            {t("transportForm.bookingNeeded")}{" "}
                            <TooltipWrapper content={t("transportForm.bookingNeededTooltip")}>
                                <Icon name="info" ml={2} />
                            </TooltipWrapper>
                        </Flex>
                    }
                />
            </Box>

            {isInconsistent && <InconsistentDatesCallout />}
            {hasTruckerAvailabilityConflict && (
                <Callout mt={2} variant="warning" data-testid="conflict-date-availability-trucker">
                    <Text>{t("unavailability.conflictTruckerUnavailableOnAskedDates")}</Text>
                </Callout>
            )}
            {hasVehicleAvailabilityConflict && (
                <Callout mt={2} variant="warning" data-testid="conflict-date-availability-vehicle">
                    <Text>{t("unavailability.conflictVehicleUnavailableOnAskedDates")}</Text>
                </Callout>
            )}
            {hasTrailerAvailabilityConflict && (
                <Callout mt={2} variant="warning" data-testid="conflict-date-availability-trailer">
                    <Text>{t("unavailability.conflictTrailerUnavailableOnAskedDates")}</Text>
                </Callout>
            )}
        </Modal>
    );

    async function handleSubmit() {
        setLoading(true);
        try {
            await dispatch(
                fetchUpdateSite(activityUid, {
                    slots: [
                        {
                            start: zoneDateToISO(startDate, timezone) as string,
                            end: zoneDateToISO(endDate, timezone) as string,
                        },
                    ],
                    is_booking_needed: isBookingNeeded,
                    locked_requested_times: lockedRequestedTimes,
                    extended_view: extendedView,
                })
            );
            setLoading(false);
            onClose();
        } catch (e) {
            setLoading(false);
        }
    }

    function handleDateChange(arrival_date: Date) {
        setArrivalDateAndTime((prev) => ({...prev, arrival_date}));
    }

    function handleArrivalTimeChange(time: {min?: string; max?: string}) {
        const result: {arrival_time_min?: string; arrival_time_max?: string} = {};
        if (time.min !== undefined) {
            result.arrival_time_min = time.min;
        }
        if (time.max !== undefined) {
            result.arrival_time_max = time.max;
        }
        if (hasSchedulerByTimeUseAskedDatesEnabled && hasSchedulerByTimeEnabled) {
            const newDateAndTime = {...arrivalDateAndTime, ...result};
            if (
                ["00:00", "", undefined, null].includes(newDateAndTime.arrival_time_min) &&
                ["23:59", "", undefined, null].includes(newDateAndTime.arrival_time_max)
            ) {
                setLockedRequestedTimes(false);
            } else if (
                ["00:00", "", undefined, null].includes(arrivalDateAndTime.arrival_time_min) &&
                ["23:59", "", undefined, null].includes(arrivalDateAndTime.arrival_time_max)
            ) {
                setLockedRequestedTimes(true);
            }
        }
        setArrivalDateAndTime((prev) => ({...prev, ...result}));
    }
};

const _getArrivalDate = (date?: Date, minDate?: Date | null, maxDate?: Date | null) => {
    if (date) {
        return date;
    }
    const today = new Date();
    if (minDate && minDate > today) {
        return minDate;
    }
    if (maxDate && maxDate < today) {
        return maxDate;
    }
    return today;
};

const _getActivityAskedDateAndTimes = (askedDates: SiteSlot | undefined, timezone: string) => {
    // v4 activity
    const {zonedStart, zonedEnd} = {
        zonedStart: askedDates ? parseAndZoneDate(askedDates.start, timezone) : null,
        zonedEnd: askedDates ? parseAndZoneDate(askedDates.end, timezone) : null,
    };
    return {
        arrival_date: zonedStart || undefined,
        arrival_time_min: zonedStart ? formatDate(zonedStart, "HH:mm") : "",
        arrival_time_max: zonedEnd ? formatDate(zonedEnd, "HH:mm") : "",
    };
};
