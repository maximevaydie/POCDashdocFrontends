import {
    getConnectedCompany,
    getMessageFromErrorCode,
    AnalyticsEvent,
    analyticsService,
    HasFeatureFlag,
    HasNotFeatureFlag,
    useToday,
    useTimezone,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Flex, Popover, Box, toast} from "@dashdoc/web-ui";
import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";

import {validateTripTypesForMerge} from "app/features/trip/trip.service";
import {InvalidTripType, CompactTrip} from "app/features/trip/trip.types";
import {useExtendedView} from "app/hooks/useExtendedView";
import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";
import {fetchMergeTripsIntoTrip, MergeTripParameters} from "app/redux/actions/scheduler-trip";

import {InvalidTripsToMergeModal} from "./invalid-trips-to-merge-modal";
import {mergeTripService} from "./mergeTrip.service";
import {MergeTripOption} from "./MergeTripOption";
import {TripOptimizationModal} from "./trip-optimization-modal/TripOptimizationModal";

export const MergeTripButton = ({
    selectedTrips,
    onMerged,
}: {
    selectedTrips: CompactTrip[];
    onMerged: (tripUid: string) => void;
}) => {
    const dispatch = useDispatch();
    const {extendedView} = useExtendedView();
    const [isLoading, setLoading] = useState(false);
    const company = useSelector(getConnectedCompany);
    const hasSchedulerByTimeEnabled = useSchedulerByTimeEnabled();
    const today = useToday();
    const timezone = useTimezone();

    const [invalidData, setInvalidData] = useState<{
        invalidTripsInfo: {trip: CompactTrip; reason: InvalidTripType}[];
        validTrips: CompactTrip[];
        optimizeDistance: boolean;
    } | null>(null);

    const [tripOptimizationData, setTripOptimizationData] = useState<{
        validTrips: CompactTrip[];
    } | null>(null);

    return (
        <Flex width="100%" justifyContent="center" p={2} pb={0}>
            <HasFeatureFlag flagName="tripOptimization">
                <Popover>
                    <Popover.Trigger>
                        <Button variant="primary" loading={isLoading} data-testid="create-trip">
                            {t("trip.createTrip")}
                        </Button>
                    </Popover.Trigger>
                    <Popover.Content borderRadius={0} border={null}>
                        <Flex justifyContent="center" flexDirection="column">
                            <MergeTripOption
                                icon="calendar"
                                label={t("optimization.organizeAccordingToTimings")}
                                description={t("optimization.organizeAccordingToTimingsDetails")}
                                onClick={() => submitMerge(false)}
                                testId="timings-organization"
                                isLoading={isLoading}
                            />

                            <Box borderBottom="1px solid" borderColor="grey.light" my={1} />
                            <MergeTripOption
                                icon="robot"
                                label={t("optimization.minimizeTraveledDistance")}
                                description={t("optimization.minimizeTraveledDistanceDetails")}
                                onClick={() => submitMerge(true)}
                                testId="minimize-distance"
                                isLoading={isLoading}
                            />
                        </Flex>
                    </Popover.Content>
                </Popover>
            </HasFeatureFlag>
            <HasNotFeatureFlag flagName="tripOptimization">
                <Button
                    variant="primary"
                    loading={isLoading}
                    onClick={() => submitMerge(false)}
                    data-testid="create-trip"
                >
                    {t("trip.createTrip")}
                </Button>
            </HasNotFeatureFlag>
            {invalidData && (
                <InvalidTripsToMergeModal
                    validTrips={invalidData.validTrips}
                    invalidTripsInfo={invalidData.invalidTripsInfo}
                    onSubmit={(validTrips) =>
                        invalidData.optimizeDistance
                            ? setTripOptimizationData({validTrips})
                            : mergeTrip({
                                  validTrips,
                                  fill_scheduled_dates: !hasSchedulerByTimeEnabled,
                              })
                    }
                    isCreation={true}
                    onClose={() => setInvalidData(null)}
                />
            )}
            {tripOptimizationData && (
                <TripOptimizationModal
                    validTrips={tripOptimizationData.validTrips}
                    onSubmit={mergeTrip}
                    onClose={() => setTripOptimizationData(null)}
                />
            )}
        </Flex>
    );

    function submitMerge(optimizeDistance: boolean = false) {
        const invalidData = validateTripTypesForMerge(selectedTrips);
        if (invalidData.invalidTripsInfo.length > 0) {
            setInvalidData({...invalidData, optimizeDistance});
        } else if (optimizeDistance) {
            setTripOptimizationData({validTrips: selectedTrips});
        } else {
            mergeTrip({
                validTrips: selectedTrips,
                fill_scheduled_dates: !hasSchedulerByTimeEnabled,
            });
        }
    }

    async function mergeTrip({
        validTrips,
        ...mergeTripParamaters
    }: {validTrips: CompactTrip[]} & MergeTripParameters) {
        setLoading(true);
        const validTripsUids = validTrips.map((t) => t.uid);

        const tripUid = validTripsUids[0];
        const mergeTripPayload = {
            trip_uids: validTripsUids.slice(1),
            ...mergeTripParamaters,
        };

        try {
            const response: any = await dispatch(
                fetchMergeTripsIntoTrip(tripUid, extendedView, mergeTripPayload)
            );
            const mergedTrip = response.entities.schedulerTrips[response.result];
            const tripOptimizationError = mergedTrip.trip_optimization_error;
            if (tripOptimizationError) {
                const errorReason = getMessageFromErrorCode(tripOptimizationError);

                toast.error(
                    t("optimization.tripOptimizationError") +
                        (errorReason === null ? "" : " " + errorReason),
                    {
                        autoClose: 30000,
                        toastId: "trip-optimization-error",
                    }
                );
            }

            analyticsService.sendEvent(
                AnalyticsEvent.tripCreated,
                mergeTripService.getTripCreatedAnalyticsEventData({
                    company,
                    today,
                    timezone,
                    tripUid,
                    validTrips,
                    tripOptimizationError,
                    ...mergeTripParamaters,
                })
            );
            onMerged(tripUid);
        } catch {
            //pass
        }
        setLoading(false);
    }
};
