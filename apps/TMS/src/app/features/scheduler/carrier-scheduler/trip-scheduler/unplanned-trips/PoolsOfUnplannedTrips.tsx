import {HasFeatureFlag, HasNotFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Tabs, Text} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import React, {useCallback} from "react";
import {useSelector} from "react-redux";

import {
    PoolOfUnplannedTrips,
    PoolOfUnplannedTripsProps,
} from "app/features/trip/pool-of-unplanned-trips/PoolOfUnplannedTrips";
import {
    getUnplannedBasicTripsForCurrentQuery,
    getUnplannedPreparedTripsForCurrentQuery,
} from "app/redux/selectors";

import {EmptyPreparedTrips} from "./EmptyPreparedTrips";
import {MergeTripButton} from "./merge-trips/MergeTripButton";

type WithRequired<T, K extends keyof T> = T & {[P in K]-?: T[P]};
type PoolsOfUnplannedTripsProps = Omit<
    WithRequired<PoolOfUnplannedTripsProps, "onTripSelected">,
    "poolType" | "withDraggableRows" | "PoolEmptyList"
>;

export const PoolsOfUnplannedTrips = ({
    onTripSelected,
    selectedTrips,
    setSelectedTrips,
    draggedTripUid,
    lockedTripsUids,
    onTripHovered,
}: PoolsOfUnplannedTripsProps) => {
    const {totalCount: numberOfBasicTrips} = useSelector(getUnplannedBasicTripsForCurrentQuery);
    const {totalCount: numberOfPreparedTrips} = useSelector(
        getUnplannedPreparedTripsForCurrentQuery
    );

    const getEmptyDroppable = useCallback(() => {
        return <EmptyPreparedTrips isDraggingOver={false} />;
    }, []);
    const tabs = [
        {
            label:
                formatNumber(numberOfBasicTrips) +
                " " +
                t("common.transports", {smart_count: numberOfBasicTrips ?? 2}, {capitalize: true}),
            testId: "basic-trips-tab",
            content: (
                <>
                    <Box height={selectedTrips.length > 1 ? "calc(100% - 60px)" : "100%"}>
                        <PoolOfUnplannedTrips
                            poolType="basic"
                            onTripSelected={onTripSelected}
                            setSelectedTrips={setSelectedTrips}
                            selectedTrips={selectedTrips}
                            draggedTripUid={draggedTripUid}
                            lockedTripsUids={lockedTripsUids}
                            onTripHovered={onTripHovered}
                        />
                    </Box>
                    {selectedTrips.length > 1 && (
                        <MergeTripButton
                            selectedTrips={selectedTrips}
                            onMerged={(tripUid) => {
                                setSelectedTrips([]);
                                onTripSelected(tripUid);
                            }}
                        />
                    )}
                </>
            ),
        },
        {
            label:
                formatNumber(numberOfPreparedTrips) +
                " " +
                t("common.trips", {smart_count: numberOfPreparedTrips ?? 2}, {capitalize: true}),
            testId: "prepared-trips-tab",
            content: (
                <>
                    <Box height="100%">
                        <PoolOfUnplannedTrips
                            poolType="prepared"
                            PoolEmptyList={getEmptyDroppable}
                            onTripSelected={onTripSelected}
                            setSelectedTrips={setSelectedTrips}
                            selectedTrips={selectedTrips}
                            draggedTripUid={draggedTripUid}
                            lockedTripsUids={lockedTripsUids}
                            onTripHovered={onTripHovered}
                        />
                    </Box>
                </>
            ),
        },
    ];

    return (
        <>
            <HasFeatureFlag flagName="tripCreation">
                <Box height={"calc(100% - 105px)"} maxHeight="calc(100% - 105px)">
                    <Tabs
                        data-testid="pool-of-unplanned-trips"
                        tabs={tabs}
                        forceRenderTabPanels={true}
                    />
                </Box>
            </HasFeatureFlag>
            <HasNotFeatureFlag flagName="tripCreation">
                <Flex alignItems="space-between" px={3} pt={2} pb={1}>
                    <Text>
                        {formatNumber(numberOfBasicTrips) +
                            " " +
                            t(
                                "common.transports",
                                {smart_count: numberOfBasicTrips ?? 2},
                                {capitalize: true}
                            )}
                    </Text>
                </Flex>
                <>
                    <Box height={"calc(100% - 84px)"}>
                        <PoolOfUnplannedTrips
                            poolType="basic"
                            onTripSelected={onTripSelected}
                            setSelectedTrips={setSelectedTrips}
                            selectedTrips={selectedTrips}
                            draggedTripUid={draggedTripUid}
                            lockedTripsUids={lockedTripsUids}
                            onTripHovered={onTripHovered}
                        />
                    </Box>
                </>
            </HasNotFeatureFlag>
        </>
    );
};
