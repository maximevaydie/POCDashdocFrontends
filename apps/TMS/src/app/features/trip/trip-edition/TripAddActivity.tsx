import {t} from "@dashdoc/web-core";
import {Box, Button, FloatingPanelWithValidationButtons, Icon, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent, useState} from "react";
import {useDispatch} from "react-redux";

import {InvalidTripsToMergeModal} from "app/features/scheduler/carrier-scheduler/trip-scheduler/unplanned-trips/merge-trips/invalid-trips-to-merge-modal";
import {PoolFilteringBar} from "app/features/scheduler/carrier-scheduler/trip-scheduler/unplanned-trips/PoolFilteringBar";
import {validateTripTypesForMerge} from "app/features/trip/trip.service";
import {useExtendedView} from "app/hooks/useExtendedView";
import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";
import {fetchMergeTripsIntoTrip} from "app/redux/actions/scheduler-trip";

import {PoolOfUnplannedTrips} from "../pool-of-unplanned-trips";
import {CompactTrip, InvalidTripType} from "../trip.types";

type TripAddActivityProps = {
    tripUid: string;
};

const TripAddActivity: FunctionComponent<TripAddActivityProps> = ({tripUid}) => {
    const dispatch = useDispatch();
    const [isAddActivityPanelOpen, openAddActivityPanel, closeAddActivityPanel] = useToggle();
    const [selectedTrips, setSelectedTrips] = useState<Array<CompactTrip>>([]);
    const [invalidData, setInvalidData] = useState<{
        invalidTripsInfo: {trip: CompactTrip; reason: InvalidTripType}[];
        validTrips: CompactTrip[];
    } | null>(null);

    const {extendedView} = useExtendedView();
    const hasSchedulerByTimeEnabled = useSchedulerByTimeEnabled();

    const selectedActivities = selectedTrips.map((trip) => trip.activities);
    const closeAndResetAddActivityPanel = () => {
        setSelectedTrips([]);
        closeAddActivityPanel();
    };

    const submitAddActivities = () => {
        const invalidData = validateTripTypesForMerge(selectedTrips);
        if (invalidData.invalidTripsInfo.length > 0) {
            setInvalidData(invalidData);
        } else if (invalidData.validTrips.length >= 1) {
            addActivities(invalidData.validTrips);
        }
    };

    const addActivities = (validTrips: CompactTrip[]) => {
        setInvalidData(null);
        fetchMergeTripsIntoTrip(tripUid, extendedView, {
            trip_uids: validTrips.map((t) => t.uid),
            fill_scheduled_dates: !hasSchedulerByTimeEnabled,
        })(dispatch).then(closeAndResetAddActivityPanel);
    };

    const addActivityTitle = (
        <Text variant="title" color="grey.dark" width="100%">
            {t("trip.addActivity")}
        </Text>
    );

    return (
        <>
            <Button
                variant="plain"
                onClick={openAddActivityPanel}
                mt={3}
                data-testid="add-activities-to-trip"
            >
                <Icon name="add" mr={1} /> {t("trip.addActivity")}
            </Button>
            {isAddActivityPanelOpen && (
                <FloatingPanelWithValidationButtons
                    width={0.45}
                    minWidth={600}
                    onClose={closeAndResetAddActivityPanel}
                    mainButton={{
                        onClick: submitAddActivities,
                    }}
                    secondaryButtons={[]}
                    indications={[
                        t("trip.addSelectedTripNumber", {
                            smart_count: selectedTrips.length,
                        }),
                        t("trip.addSelectedActivitiesNumber", {
                            smart_count: selectedActivities.length,
                        }),
                    ]}
                    title={addActivityTitle}
                >
                    <Box mx={-4} mt={-4}>
                        <PoolFilteringBar filteringBarId="pool-filtering-bar-in-add-activity-to-trip" />
                    </Box>
                    <Box
                        flex={1}
                        id="add-activity-to-trip-side-panel"
                        mx={-5}
                        height="calc(100% - 98px)"
                    >
                        <PoolOfUnplannedTrips
                            poolType="basic"
                            selectedTrips={selectedTrips}
                            setSelectedTrips={setSelectedTrips}
                            withDraggableRows={false}
                        />
                    </Box>
                    {invalidData && (
                        <InvalidTripsToMergeModal
                            validTrips={invalidData.validTrips}
                            invalidTripsInfo={invalidData.invalidTripsInfo}
                            isCreation={false}
                            onSubmit={addActivities}
                            onClose={() => setInvalidData(null)}
                        />
                    )}
                </FloatingPanelWithValidationButtons>
            )}
        </>
    );
};

export default TripAddActivity;
