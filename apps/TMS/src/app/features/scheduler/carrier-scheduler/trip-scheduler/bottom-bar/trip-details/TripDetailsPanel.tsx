import {Logger, t} from "@dashdoc/web-core";
import {Card, Tabs, Box, Flex} from "@dashdoc/web-ui";
import React, {useEffect} from "react";

import {preselectedSchedulerBottomBarState} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/trip-details/preselectedSchedulerBottomBarState";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {useHasEditionRightsOnTrip} from "app/features/trip/hook/useHasEditionRightsOnTrip";
import {SendToTruckerButton} from "app/features/trip/trip-edition/trip-means/SendToTruckerButton";
import {useExtendedView} from "app/hooks/useExtendedView";
import {fetchRetrieveTrip} from "app/redux/actions/trips";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getCompactTripByUid} from "app/redux/selectors";

import {LockRequestedTimesActionButton} from "./components/LockRequestedTimesActionButton";
import {TransportInformation} from "./components/TransportInformation";
import {TripActivities} from "./components/trip-activities/TripActivities";

type Props = {
    tripUid: string | null;
    view: TripSchedulerView;
};
export function TripDetailsPanel({tripUid, view}: Props) {
    const [preselectedSchedulerBottomBar, setPreselectedSchedulerBottomBar] =
        preselectedSchedulerBottomBarState({trip: false, tripTabIndex: 0, resource: false});
    useFetchDetailedTrip(tripUid);
    const trip = useSelector((state) => (tripUid ? getCompactTripByUid(state, tripUid) : null));
    const editable = useHasEditionRightsOnTrip(trip?.carrier);

    if (!trip) {
        return null;
    }
    const canSendToTrucker =
        (["ongoing", "unstarted"] as Array<string | undefined>).includes(trip.status) &&
        trip.trucker_status === "trucker_assigned" &&
        editable;

    return (
        <>
            <Card
                height="100%"
                maxHeight="100%"
                display="flex"
                flexDirection="column"
                boxShadow="none"
                border="1px solid"
                borderColor="grey.light"
                data-testid="trip-detailed-bar"
            >
                <Box flex={1} overflow="auto">
                    <Tabs
                        initialActiveTab={preselectedSchedulerBottomBar.tripTabIndex}
                        onTabChanged={(index) =>
                            setPreselectedSchedulerBottomBar((prev) => ({
                                ...prev,
                                tripTabIndex: index,
                            }))
                        }
                        tabs={[
                            {
                                label: t("scheduler.transportInformation"),
                                testId: "information-tab",
                                content: (
                                    <TransportInformation
                                        trip={trip}
                                        view={view}
                                        editable={editable}
                                    />
                                ),
                            },
                            {
                                label: t("common.activities"),
                                testId: "activity-tab",
                                content: (
                                    <TripActivities
                                        key={tripUid}
                                        tripUid={tripUid}
                                        editable={editable}
                                        view={view}
                                    />
                                ),
                            },
                        ]}
                        actionButton={
                            <Flex m={1}>
                                <LockRequestedTimesActionButton trip={trip} />
                                {canSendToTrucker ? (
                                    <Box ml={1}>
                                        <SendToTruckerButton tripUid={trip.uid} />
                                    </Box>
                                ) : null}
                            </Flex>
                        }
                        alignItems="flex-end"
                    />
                </Box>
            </Card>
        </>
    );
}

function useFetchDetailedTrip(tripUid: string | null) {
    const dispatch = useDispatch();
    const {extendedView} = useExtendedView();
    useEffect(() => {
        if (!tripUid) {
            Logger.error("Tried to access a trip details without an uid");
        } else {
            try {
                dispatch(fetchRetrieveTrip(tripUid, extendedView));
            } catch (e) {
                Logger.error(`Trip with uid ${tripUid} not found.`);
            }
        }
    }, [dispatch, extendedView, tripUid]);
}
