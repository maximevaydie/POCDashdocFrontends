import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {DateTimePickerFormInput, Text, getISODates} from "@dashdoc/web-ui";
import {SiteSlot} from "dashdoc-utils";
import {formatDate, parseAndZoneDate} from "dashdoc-utils";
import debounce from "lodash.debounce";
import React, {useCallback, useEffect, useMemo} from "react";

import {LockRequestedTimesSwitch} from "app/features/transport/transport-details/transport-details-activities/activity/LockRequestedTimesSwitch";
import {SimilarActivityWithTransportData} from "app/features/trip/trip.types";
import {useExtendedView} from "app/hooks/useExtendedView";
import {
    fetchBulkUpdateActivitites,
    fetchPartialTripUpdateAction,
    fetchRetrieveTrip,
} from "app/redux/actions/trips";
import {useDispatch} from "app/redux/hooks";

import {isTripActivityStarted} from "../../trip.service";

export const ActivityScheduledDatesEdition = ({
    tripUid,
    activity,
    readOnly,
}: {
    tripUid: string;
    activity: SimilarActivityWithTransportData;
    readOnly: boolean;
}) => {
    const dispatch = useDispatch();
    const {extendedView} = useExtendedView();
    const disableEdition = isTripActivityStarted(activity);
    const timezone = useTimezone();

    const uids = useMemo(
        () => (activity.similarUids.length > 0 ? activity.similarUids : [activity.uid]),
        // activity is recomputed regularly by selector and we just need to compute uids again when we change activity
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [activity.uid]
    );

    const debounceBulkUpdateActivitites = useCallback(
        debounce(
            (start: string | undefined, end: string | undefined, lockRequestedTimes: boolean) => {
                try {
                    dispatch(
                        fetchBulkUpdateActivitites(
                            tripUid,
                            uids,
                            {
                                start,
                                end,
                                locked_requested_times: lockRequestedTimes,
                            },
                            extendedView
                        )
                    );
                } catch {
                    () => {
                        dispatch(fetchRetrieveTrip(tripUid, extendedView));
                    };
                }
            },
            5000
        ),
        [tripUid, extendedView, dispatch, uids]
    );

    useEffect(() => {
        return debounceBulkUpdateActivitites.flush;
    }, [debounceBulkUpdateActivitites]);

    return (
        <>
            {activity.slots && activity.slots.length > 0 && (
                <LockRequestedTimesSwitch
                    value={activity.locked_requested_times ?? false}
                    onChange={onSubmitLockedAskedDates}
                />
            )}
            <Text color="grey.dark" variant="h1" mr={2} my={4}>
                {t("common.plannedDate")}
            </Text>
            <DateTimePickerFormInput
                value={activity.scheduled_range}
                disabled={disableEdition || readOnly}
                autoFocus
                onChange={onSubmitScheduledDates}
            />
        </>
    );

    function onSubmitScheduledDates(range?: SiteSlot) {
        if (!range) {
            return;
        }
        const {start, end} = range;

        if (
            start === null ||
            end === null ||
            (start === activity.scheduled_range?.start && end === activity.scheduled_range?.end)
        ) {
            return;
        }

        dispatch(
            fetchPartialTripUpdateAction(uids, {
                scheduled_range: {start, end},
                locked_requested_times: false,
            })
        );
        debounceBulkUpdateActivitites(start, end, false);
    }

    function onSubmitLockedAskedDates(value: boolean) {
        const askedDateRange = activity.slots?.[0];
        const date = activity.scheduled_range
            ? parseAndZoneDate(activity.scheduled_range.start, timezone)
            : askedDateRange
              ? parseAndZoneDate(askedDateRange.start, timezone)
              : null;
        let range = activity.scheduled_range;
        if (value && askedDateRange && date) {
            const startTime = formatDate(
                parseAndZoneDate(askedDateRange.start, timezone),
                "HH:mm"
            );
            const endTime = formatDate(parseAndZoneDate(askedDateRange.end, timezone), "HH:mm");
            range = getISODates(date, startTime, endTime, timezone);
        }
        dispatch(
            fetchPartialTripUpdateAction(uids, {
                scheduled_range: range ?? undefined,
                locked_requested_times: value,
            })
        );
        debounceBulkUpdateActivitites(range?.start, range?.end, value);
    }
};
