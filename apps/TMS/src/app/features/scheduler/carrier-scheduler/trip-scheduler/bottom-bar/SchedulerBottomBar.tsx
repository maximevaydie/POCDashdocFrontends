import {Box, Flex, useDevice, ResizableBox} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useEffect} from "react";

import {ResourceDetailsPanel} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/resource-details/ResourceDetailsPanel";
import {preselectedSchedulerBottomBarState} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/trip-details/preselectedSchedulerBottomBarState";
import {TripDetailsButton} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/trip-details/TripDetailsButton";
import {TripDetailsPanel} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/trip-details/TripDetailsPanel";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";

import {HoveredBar} from "./HoveredBar";

type Props = {
    hoverTripUid: string | null;
    hoverActivityUidAndNumber: {uid: string; count: number} | null;
    previewTripUid: string | null;
    view: TripSchedulerView;
    onTripSelected: (tripUid: string) => void;
    onTripHovered: (uid: string | null) => void;
    onActivityHovered: (value: {uid: string; count: number} | null) => void;
};
export function SchedulerBottomBar({
    hoverTripUid,
    hoverActivityUidAndNumber,
    previewTripUid,
    view,
    onTripSelected,
    onTripHovered,
    onActivityHovered,
}: Props) {
    const isMobileDevice = useDevice() === "mobile";
    const [preselectedSchedulerBottomBar, setPreselectedSchedulerBottomBar] =
        preselectedSchedulerBottomBarState({trip: false});
    const [isTripDetailsOpen, openTripDetails, closeTripDetails] = useToggle(
        preselectedSchedulerBottomBar.trip
    );
    const showDetailsPanel = isTripDetailsOpen && previewTripUid;
    useEffect(() => {
        if (!isTripDetailsOpen && previewTripUid) {
            openTripDetails();
            setPreselectedSchedulerBottomBar((prev) => ({
                ...prev,
                trip: true,
            }));
        }
        // Keep only previewTripUid in dependencies as I want panel to open only when select a trip to preview
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewTripUid]);

    return (
        <ResizableBox
            allowedDirections={["top"]}
            minSize={showDetailsPanel ? {height: "220px"} : undefined}
            height={showDetailsPanel ? "254px" : "auto"} // initial height
            maxHeight={"calc(100vh - 200px)"}
            disabled={!showDetailsPanel}
            key={showDetailsPanel ? "details-panel" : "hover-bar"}
        >
            <Flex style={{gap: "4px"}} px={2}>
                <Box flex={1}>
                    <TripDetailsButton
                        tripUid={previewTripUid}
                        isOpen={isTripDetailsOpen}
                        open={handleOpenTripDetails}
                        close={handleCloseTripDetails}
                        view={view}
                    />
                </Box>
                {!isMobileDevice && (
                    <Flex flex={1}>
                        <HoveredBar
                            tripUid={hoverTripUid}
                            activityUidAndNumber={hoverActivityUidAndNumber}
                        />
                    </Flex>
                )}
            </Flex>

            {showDetailsPanel && (
                <Flex style={{gap: "4px"}} height="calc(100% - 36px)" px={2} mt={1}>
                    <Box flex={1} height="100%">
                        <TripDetailsPanel tripUid={previewTripUid} view={view} />
                    </Box>

                    {!isMobileDevice && (
                        <ResizableBox
                            allowedDirections={["left"]}
                            width={"50%"} // initial width
                            minSize={{width: "260px"}}
                            height="100%"
                            maxWidth={"calc(100vw - 460px)"}
                        >
                            <ResourceDetailsPanel
                                tripUid={previewTripUid}
                                view={view}
                                onTripSelected={onTripSelected}
                                onTripHovered={onTripHovered}
                                onActivityHovered={onActivityHovered}
                            />
                        </ResizableBox>
                    )}
                </Flex>
            )}
        </ResizableBox>
    );

    function handleOpenTripDetails() {
        openTripDetails();
        setPreselectedSchedulerBottomBar((prev) => ({...prev, trip: true}));
    }
    function handleCloseTripDetails() {
        closeTripDetails();
        setPreselectedSchedulerBottomBar((prev) => ({...prev, trip: false}));
    }
}
