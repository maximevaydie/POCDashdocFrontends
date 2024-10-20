import {
    AnalyticsEvent,
    analyticsService,
    apiService,
    getConnectedCompany,
    getConnectedManager,
    isDateInconsistent,
    useTimezone,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    Checkbox,
    DateTimePicker,
    Flex,
    Modal,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {FormGroup} from "@dashdoc/web-ui";
import {
    APIVersion,
    formatDate,
    getSiteZonedRealDateTimes,
    parseAndZoneDate,
    zoneDateToISO,
} from "dashdoc-utils";
import {isEqual, set} from "date-fns";
import React, {useCallback, useEffect, useMemo, useState} from "react";

import {useExtendedView} from "app/hooks/useExtendedView";
import {fetchUpdateBreakSegmentScheduledDate} from "app/redux/actions";
import {useSelector, useDispatch} from "app/redux/hooks";

import type {Segment, Transport} from "app/types/transport";
type UpdateSiteArrivalDateModalProps = {
    segmentToBreakSite: Segment;
    segmentFromBreakSite: Segment;
    transport: Transport;
    onClose: () => void;
    beforeLaterStartDate?: string;
    afterEarlierEndDate?: string;
};

function UpdateBreakDateModal({
    segmentToBreakSite,
    segmentFromBreakSite,
    transport,
    onClose,
    beforeLaterStartDate,
    afterEarlierEndDate,
}: UpdateSiteArrivalDateModalProps) {
    const dispatch = useDispatch();
    const timezone = useTimezone();
    const manager = useSelector(getConnectedManager);
    const company = useSelector(getConnectedCompany);
    const {extendedView} = useExtendedView();

    const {zonedStart: zonedRealStart, zonedEnd: zonedRealEnd} = getSiteZonedRealDateTimes(
        segmentFromBreakSite.origin,
        timezone
    );

    const getMinAndMaxDate = useCallback(
        (init = false) => {
            const minDate =
                segmentToBreakSite?.scheduled_start_range?.start ??
                (init && segmentToBreakSite?.origin?.slots?.length > 0
                    ? segmentToBreakSite.origin.slots[0].start
                    : null);
            const maxDate =
                segmentFromBreakSite?.scheduled_end_range?.end ??
                (init && segmentFromBreakSite?.destination?.slots?.length > 0
                    ? segmentFromBreakSite.destination.slots[0].end
                    : null);
            return {
                minDate: minDate ? parseAndZoneDate(minDate, timezone) : null,
                maxDate: maxDate ? parseAndZoneDate(maxDate, timezone) : null,
            };
        },
        [
            segmentFromBreakSite.destination.slots,
            segmentFromBreakSite?.scheduled_end_range,
            segmentToBreakSite.origin.slots,
            segmentToBreakSite?.scheduled_start_range,
            timezone,
        ]
    );

    const _getDateSlot = useCallback(() => {
        let {minDate: minDate, maxDate: maxDate} = getMinAndMaxDate(true);
        let defaultDate = new Date();
        // @ts-ignore
        if (defaultDate < minDate || defaultDate > maxDate) {
            defaultDate = minDate ?? maxDate ?? new Date();
        }
        let defaultDateRange = {start: defaultDate, end: defaultDate};
        // initialization if only one date set
        if (segmentToBreakSite?.scheduled_end_range) {
            defaultDateRange = {
                // @ts-ignore
                start: parseAndZoneDate(segmentToBreakSite.scheduled_end_range.start, timezone),
                // @ts-ignore
                end: parseAndZoneDate(segmentToBreakSite.scheduled_end_range.end, timezone),
            };
        }
        if (segmentFromBreakSite?.scheduled_start_range) {
            defaultDateRange = {
                // @ts-ignore
                start: parseAndZoneDate(
                    segmentFromBreakSite.scheduled_start_range.start,
                    timezone
                ),
                // @ts-ignore
                end: parseAndZoneDate(segmentFromBreakSite.scheduled_start_range.end, timezone),
            };
        }
        const startDateRange = segmentToBreakSite?.scheduled_end_range
            ? {
                  start: parseAndZoneDate(segmentToBreakSite.scheduled_end_range.start, timezone),
                  end: parseAndZoneDate(segmentToBreakSite.scheduled_end_range.end, timezone),
              }
            : defaultDateRange;
        const endDateRange = segmentFromBreakSite?.scheduled_start_range
            ? {
                  start: parseAndZoneDate(
                      segmentFromBreakSite.scheduled_start_range.start,
                      timezone
                  ),
                  end: parseAndZoneDate(segmentFromBreakSite.scheduled_start_range.end, timezone),
              }
            : defaultDateRange;
        return {
            startDate: startDateRange.start,
            startMinTime: formatDate(startDateRange.start, "HH:mm"),
            startMaxTime: formatDate(startDateRange.end, "HH:mm"),
            endDate: endDateRange.start,
            endTimeMin: formatDate(endDateRange.start, "HH:mm"),
            endTimeMax: formatDate(endDateRange.end, "HH:mm"),
            isDifferentEnd:
                // @ts-ignore
                !isEqual(startDateRange.start, endDateRange.start) ||
                // @ts-ignore
                !isEqual(startDateRange.end, endDateRange.end),
        };
    }, [
        getMinAndMaxDate,
        segmentToBreakSite.scheduled_end_range,
        segmentFromBreakSite.scheduled_start_range,
        timezone,
    ]);

    const initState = _getDateSlot();
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(initState.startDate);
    const [startTimeMin, setStartTimeMin] = useState(initState.startMinTime);
    const [startTimeMax, setStartTimeMax] = useState(initState.startMaxTime);
    const [endDate, setEndDate] = useState(initState.endDate);
    const [endTimeMin, setEndTimeMin] = useState(initState.endTimeMin);
    const [endTimeMax, setEndTimeMax] = useState(initState.endTimeMax);
    const [isDifferentEnd, setIsDifferentEnd] = useState(initState.isDifferentEnd);
    const [hasTruckerAvailabilityConflict, setTruckerAvailabilityConflict] = useState(false);
    const [hasVehicleAvailabilityConflict, setVehicleAvailabilityConflict] = useState(false);
    const [hasTrailerAvailabilityConflict, setTrailerAvailabilityConflict] = useState(false);

    const computedStartDateRange = useMemo(() => {
        let startDateLower = startDate;
        let startDateUpper = startDate;
        const [startHours = "00", startMinutes = "00"] = startTimeMin
            ? startTimeMin.split(":")
            : [];
        // @ts-ignore
        startDateLower = set(new Date(startDate), {
            hours: parseInt(startHours),
            minutes: parseInt(startMinutes),
        });
        const [endHours = "23", endMinutes = "59"] = startTimeMax ? startTimeMax.split(":") : [];
        // @ts-ignore
        startDateUpper = set(new Date(startDate), {
            hours: parseInt(endHours),
            minutes: parseInt(endMinutes),
        });

        return {
            start: startDateLower,
            end: startDateUpper,
        };
    }, [startDate, startTimeMax, startTimeMin]);

    const computedStartDateRangeISO = useMemo(() => {
        return {
            start: zoneDateToISO(computedStartDateRange.start, timezone),
            end: zoneDateToISO(computedStartDateRange.end, timezone),
        };
    }, [computedStartDateRange, timezone]);

    const computedEndDateRange = useMemo(() => {
        let endDateLower = endDate;
        let endDateUpper = endDate;
        const [startHours = "00", startMinutes = "00"] = endTimeMin ? endTimeMin.split(":") : [];
        // @ts-ignore
        endDateLower = set(new Date(endDate), {
            hours: parseInt(startHours),
            minutes: parseInt(startMinutes),
        });
        const [endHours = "23", endMinutes = "59"] = endTimeMax ? endTimeMax.split(":") : [];
        // @ts-ignore
        endDateUpper = set(new Date(endDate), {
            hours: parseInt(endHours),
            minutes: parseInt(endMinutes),
        });

        return {
            start: endDateLower,
            end: endDateUpper,
        };
    }, [endDate, endTimeMax, endTimeMin, timezone]);

    const computedEndDateRangeISO = useMemo(() => {
        return {
            start: zoneDateToISO(computedEndDateRange.start, timezone),
            end: zoneDateToISO(computedEndDateRange.end, timezone),
        };
    }, [computedEndDateRange, timezone]);

    const checkAvailabilityConflict = useCallback(
        async (type: "trucker" | "vehicle" | "trailer") => {
            let baseUrl;
            let toItemPk;
            let fromItemPk;
            let setAvailabilityFunction;
            let apiVersion: APIVersion = "v4";
            switch (type) {
                case "trucker":
                    baseUrl = "manager-truckers";
                    toItemPk = segmentToBreakSite?.trucker?.pk;
                    fromItemPk = segmentFromBreakSite?.trucker?.pk;
                    setAvailabilityFunction = setTruckerAvailabilityConflict;
                    apiVersion = "web";
                    break;
                case "vehicle":
                    baseUrl = "vehicles";
                    toItemPk =
                        segmentToBreakSite?.vehicle?.original ?? segmentToBreakSite?.vehicle?.pk;
                    fromItemPk =
                        segmentFromBreakSite?.vehicle?.original ??
                        segmentFromBreakSite?.vehicle?.pk;
                    setAvailabilityFunction = setVehicleAvailabilityConflict;
                    break;
                case "trailer":
                    baseUrl = "trailers";
                    toItemPk =
                        segmentToBreakSite?.trailers?.[0]?.original ??
                        segmentToBreakSite?.trailers?.[0]?.pk;
                    fromItemPk =
                        segmentFromBreakSite?.trailers?.[0]?.original ??
                        segmentFromBreakSite?.trailers?.[0]?.pk;
                    setAvailabilityFunction = setTrailerAvailabilityConflict;
                    break;
            }
            if (toItemPk) {
                const resToBreakSite = await apiService
                    .post(
                        `/${baseUrl}/${toItemPk}/has-unavailability-during-trip/`,
                        {
                            trip_uid: segmentToBreakSite.origin.trip?.uid,
                            activity_uid: segmentToBreakSite.origin.uid,
                            activity_start_date: computedStartDateRangeISO.start,
                            activity_end_date: computedStartDateRangeISO.end,
                            dates_type: "scheduled",
                        },
                        {apiVersion}
                    )
                    .catch(() => {
                        return false;
                    });
                if (resToBreakSite.conflict) {
                    setAvailabilityFunction(resToBreakSite.conflict);
                    return;
                }
            }
            if (fromItemPk) {
                const resFromBreakSite = await apiService
                    .post(
                        `/${baseUrl}/${fromItemPk}/has-unavailability-during-trip/`,
                        {
                            trip_uid: segmentFromBreakSite.origin.trip?.uid,
                            activity_uid: segmentFromBreakSite.origin.uid,
                            activity_start_date: computedEndDateRangeISO.start,
                            activity_end_date: computedEndDateRangeISO.end,
                            dates_type: "scheduled",
                        },
                        {apiVersion}
                    )
                    .catch(() => {
                        return false;
                    });
                setAvailabilityFunction(resFromBreakSite.conflict);
            }
        },
        [
            segmentToBreakSite?.trucker?.pk,
            segmentToBreakSite?.vehicle?.original,
            segmentToBreakSite?.vehicle?.pk,
            segmentToBreakSite?.trailers,
            segmentToBreakSite?.origin.trip?.uid,
            segmentToBreakSite?.origin.uid,
            segmentFromBreakSite?.trucker?.pk,
            segmentFromBreakSite?.vehicle?.original,
            segmentFromBreakSite?.vehicle?.pk,
            segmentFromBreakSite?.trailers,
            segmentFromBreakSite.origin.trip?.uid,
            segmentFromBreakSite.origin.uid,
            computedStartDateRangeISO,
            computedEndDateRangeISO,
        ]
    );

    useEffect(() => {
        if (!loading) {
            checkAvailabilityConflict("trucker");
            checkAvailabilityConflict("vehicle");
            checkAvailabilityConflict("trailer");
        }
    }, [checkAvailabilityConflict, loading]);

    const handleSubmit = useCallback(() => {
        setLoading(true);
        analyticsService.sendEvent(AnalyticsEvent.plannedHoursEdited, {
            "company id": company?.pk,
            "segment uid": segmentToBreakSite.uid,
            "transport uid": transport.uid,
        });
        analyticsService.sendEvent(AnalyticsEvent.plannedHoursEdited, {
            "company id": company?.pk,
            "segment uid": segmentFromBreakSite.uid,
            "transport uid": transport.uid,
        });
        dispatch(
            fetchUpdateBreakSegmentScheduledDate({
                extended_view: extendedView,
                segment_to_break_site: {
                    uid: segmentToBreakSite.uid,
                    scheduled_end_range: computedStartDateRangeISO,
                },
                segment_from_break_site: {
                    uid: segmentFromBreakSite.uid,
                    scheduled_start_range: computedEndDateRangeISO,
                },
            })
        ).finally(() => {
            setLoading(false);
            onClose();
        });
    }, [
        manager,
        company,
        extendedView,
        segmentToBreakSite,
        transport,
        dispatch,
        computedStartDateRangeISO,
        segmentFromBreakSite.uid,
        computedEndDateRangeISO,
        onClose,
    ]);

    const handleStartDateChange = useCallback(
        (date: Date) => {
            setStartDate(date);
            // @ts-ignore
            if (date > endDate || !isDifferentEnd) {
                setEndDate(new Date(date));
            }
        },
        [endDate, isDifferentEnd]
    );

    const handleEndDateChange = useCallback(
        (date: Date) => {
            setEndDate(date);
            // @ts-ignore
            if (date < startDate) {
                setStartDate(new Date(date));
            }
        },
        [startDate]
    );

    const handleStartTimeChange = useCallback(
        (time: {min?: string; max?: string}) => {
            if (time.min !== undefined) {
                setStartTimeMin(time.min);
                if (startDate === endDate && endTimeMax < time.min) {
                    setEndTimeMin(time.min);
                    setEndTimeMax(time.min);
                }
                if (!isDifferentEnd) {
                    setEndTimeMin(time.min);
                }
            }
            if (time.max !== undefined) {
                setStartTimeMax(time.max);
                if (!isDifferentEnd) {
                    setEndTimeMax(time.max);
                }
            }
        },
        [endDate, endTimeMax, startDate, isDifferentEnd]
    );

    const handleEndTimeChange = useCallback(
        (time: {min?: string; max?: string}) => {
            if (time.min !== undefined) {
                setEndTimeMin(time.min);
            }
            if (time.max !== undefined) {
                setEndTimeMax(time.max);
                if (startDate === endDate && time.max < startTimeMin) {
                    setStartTimeMax(time.max);
                    setStartTimeMin(time.max);
                }
            }
        },
        [endDate, startDate, startTimeMin]
    );

    const handleSameDateChange = useCallback(
        (checked: boolean) => {
            setIsDifferentEnd(checked);
            if (!checked) {
                // @ts-ignore
                setEndDate(new Date(startDate));
                setEndTimeMin(startTimeMin);
                setEndTimeMax(startTimeMax);
            }
        },
        [startDate, startTimeMax, startTimeMin]
    );
    const isInconsistent = isDateInconsistent(
        computedStartDateRange?.start,
        computedEndDateRange?.end,
        timezone,
        beforeLaterStartDate,
        afterEarlierEndDate
    );
    return (
        <Modal
            id="update-break-date-modal"
            data-testid="update-break-date-modal"
            title={t("components.plannedHourModification")}
            onClose={onClose}
            mainButton={{
                children: t("common.save"),
                type: "button",
                disabled: loading,
                loading: loading,
                "data-testid": "break-scheduled-hours-save-button",
                onClick: handleSubmit,
            }}
            secondaryButton={{
                children: t("common.cancel"),
                disabled: loading,
            }}
        >
            <FormGroup>
                <Flex flexDirection={"column"} alignItems={"start"} flexWrap="wrap" mb={4}>
                    <Box alignItems="center" width="100%">
                        <Text variant="captionBold" mr={2} mb={2}>
                            {t("components.break")}
                        </Text>
                        <DateTimePicker
                            // @ts-ignore
                            date={startDate}
                            timeMin={startTimeMin}
                            timeMax={startTimeMax}
                            onDateChange={handleStartDateChange}
                            onTimeChange={handleStartTimeChange}
                            rootId="react-app-modal-root"
                            disabled={!!zonedRealStart}
                        />
                    </Box>
                </Flex>

                <Checkbox
                    onChange={handleSameDateChange}
                    checked={isDifferentEnd}
                    label={t("components.resumeBulkingBreakDateDifferentThanStartDate")}
                ></Checkbox>

                {isDifferentEnd && (
                    <Flex flexDirection={"column"} alignItems={"start"} flexWrap="wrap" mb={4}>
                        <Box alignItems="center" width="100%">
                            <Text variant="captionBold" mr={2} mb={2} mt={2}>
                                {t("components.resumption")}
                            </Text>
                            <DateTimePicker
                                // @ts-ignore
                                date={endDate}
                                timeMin={endTimeMin}
                                timeMax={endTimeMax}
                                onDateChange={handleEndDateChange}
                                onTimeChange={handleEndTimeChange}
                                rootId="react-app-modal-root"
                                disabled={!!zonedRealEnd}
                            />
                        </Box>
                    </Flex>
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
                    <Callout mt={2} variant="warning">
                        <Text>{t("unavailability.conflictTruckerUnavailable")}</Text>
                    </Callout>
                )}
                {hasVehicleAvailabilityConflict && (
                    <Callout mt={2} variant="warning">
                        <Text>{t("unavailability.conflictVehicleUnavailable")}</Text>
                    </Callout>
                )}
                {hasTrailerAvailabilityConflict && (
                    <Callout mt={2} variant="warning">
                        <Text>{t("unavailability.conflictTrailerUnavailable")}</Text>
                    </Callout>
                )}
            </FormGroup>
        </Modal>
    );
}

export default UpdateBreakDateModal;
