import {useDispatch, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Callout, LoadingWheel, Tabs} from "@dashdoc/web-ui";
import {Trailer, Vehicle} from "dashdoc-utils";
import {endOfDay, isEqual, startOfDay} from "date-fns";
import React, {useCallback, useEffect, useMemo, useState} from "react";

import {schedulerPlanPreviewService} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/schedulerPlanPreview.service";
import {Trip} from "app/features/trip/trip.types";
import {useExtendedView} from "app/hooks/useExtendedView";
import {fetchRetrieveTrip} from "app/redux/actions/trips";
import {useSelector} from "app/redux/hooks";
import {getTripByUid} from "app/redux/selectors";

import {SchedulerPlanPreviewByResource} from "./SchedulerPlanPreviewByResource";

type Props = {
    tripUid: string;
    trucker: {pk: number; display_name: string} | null;
    vehicle: Partial<Vehicle> | null;
    trailer: Partial<Trailer> | null;
    startDate: Date | null;
    setDateRange: (startDate: Date | null, endDate: Date | null) => void;
};
export function SchedulerPlanPreview({
    tripUid,
    trucker,
    vehicle,
    trailer,
    startDate,
    setDateRange,
}: Props) {
    const {extendedView} = useExtendedView();
    const dispatch = useDispatch();
    const timezone = useTimezone();
    const [loading, setLoading] = useState(true);
    const trip: Trip | null = useSelector((state) => getTripByUid(state, tripUid), isEqual);

    useEffect(() => {
        async function getTrip() {
            await dispatch(fetchRetrieveTrip(tripUid, extendedView));
            setLoading(false);
        }
        getTrip();
    }, [dispatch, tripUid, extendedView]);

    useEffect(() => {
        // if no start date defined, set a default one
        if (!startDate && trip && !loading) {
            const {start, end} = schedulerPlanPreviewService.getDefaultPreviewRangeDate(
                trip,
                timezone
            );
            setDateRange(start, end);
        }
    }, [setDateRange, startDate, timezone, trip, loading]);

    const previewDate = useMemo(() => {
        return startDate ?? new Date();
    }, [startDate]);

    const fakeTrip: Trip | null = useMemo(() => {
        if (!trip) {
            return null;
        }
        let scheduledDatesDataToUpdate = schedulerPlanPreviewService.computeTripScheduledDatesData(
            trip,
            timezone,
            previewDate
        );

        return {
            ...trip,
            ...scheduledDatesDataToUpdate,
            trucker: trucker,
            vehicle: vehicle,
            trailer: trailer,
        } as Trip;
    }, [previewDate, timezone, trailer, trip, trucker, vehicle]);

    const schedulerStartDate = useMemo(() => startOfDay(previewDate), [previewDate]);
    const schedulerEndDate = useMemo(() => endOfDay(previewDate), [previewDate]);

    const handleStartDateChange = useCallback(
        (startDate: Date | null) => {
            if (!trip || !startDate) {
                return;
            }
            const {end: endDate} = schedulerPlanPreviewService.computeTripScheduledRange(
                trip,
                timezone,
                startDate
            );
            setDateRange(startDate, endDate);
        },
        [setDateRange, timezone, trip]
    );

    const tabs = useMemo(
        () => [
            {
                label: t("common.trucker"),
                testId: "trucker-tab",
                content: (
                    <>
                        <SchedulerPlanPreviewByResource
                            trip={fakeTrip}
                            startDate={schedulerStartDate}
                            endDate={schedulerEndDate}
                            view="trucker"
                            setStartDate={handleStartDateChange}
                        />
                        <Callout mt={2}>
                            {trucker
                                ? t("plan.selectStartDateCollout")
                                : t("plan.selectResourceToShowPreview")}
                        </Callout>
                    </>
                ),
            },
            {
                label: t("common.vehicle"),
                testId: "vehicle-tab",
                content: (
                    <>
                        <SchedulerPlanPreviewByResource
                            trip={fakeTrip}
                            startDate={schedulerStartDate}
                            endDate={schedulerEndDate}
                            view="vehicle"
                            setStartDate={handleStartDateChange}
                        />
                        <Callout mt={2}>
                            {vehicle
                                ? t("plan.selectStartDateCollout")
                                : t("plan.selectResourceToShowPreview")}
                        </Callout>
                    </>
                ),
            },
            {
                label: t("common.trailer"),
                testId: "trailer-tab",
                content: (
                    <>
                        <SchedulerPlanPreviewByResource
                            trip={fakeTrip}
                            startDate={schedulerStartDate}
                            endDate={schedulerEndDate}
                            view="trailer"
                            setStartDate={handleStartDateChange}
                        />{" "}
                        <Callout mt={2}>
                            {trailer
                                ? t("plan.selectStartDateCollout")
                                : t("plan.selectResourceToShowPreview")}
                        </Callout>
                    </>
                ),
            },
        ],
        [
            fakeTrip,
            schedulerStartDate,
            schedulerEndDate,
            handleStartDateChange,
            trucker,
            vehicle,
            trailer,
        ]
    );
    if (loading) {
        return <LoadingWheel />;
    }
    return <Tabs tabs={tabs} />;
}
