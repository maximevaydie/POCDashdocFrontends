import {Flex, LoadingWheel, Text} from "@dashdoc/web-ui";
import React, {useContext} from "react";

import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {useSelector} from "app/redux/hooks";
import {getPlannedTripsCurrentQueryLoadingStatus} from "app/redux/selectors";
import {PoolCurrentQueryContext} from "app/screens/trip/TripEditionScreen";

import {ResourcesFilteringBar} from "./ResourcesFilteringBar";

export function ResourceHeader() {
    const {currentQuery: filter} = useContext(PoolCurrentQueryContext);
    const isLoadingTrips = useSelector(getPlannedTripsCurrentQueryLoadingStatus);

    return (
        <Flex justifyContent="space-between" alignItems="center" width="100%">
            <ResourcesFilteringBar view={filter.view as TripSchedulerView} />
            <Text fontSize="7px" lineHeight="10px">
                {isLoadingTrips && <LoadingWheel noMargin inline />}
            </Text>
        </Flex>
    );
}
