import {Box, Flex, themeAwareCss, useResourceOffset} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React, {ReactNode} from "react";

import {CardLineHeight} from "app/features/scheduler/carrier-scheduler/components/card-content/cardLineHeights.constants";
import {useSchedulerCardSettings} from "app/features/scheduler/carrier-scheduler/hooks/useSchedulerCardSettings";

import {ActivityList} from "./card-sections/activities/by-day/ActivityList";
import {ActivitiesTimeline} from "./card-sections/activities/timeline/ActivitiesTimeline";
import {Instructions} from "./card-sections/Instructions";
import {Means} from "./card-sections/Means";
import {RequestedVehicleLabel} from "./card-sections/RequestedVehicleLabel";
import {ShipperOrTripName} from "./card-sections/ShipperOrTripName";
import {StatusIcon} from "./card-sections/StatusIcon";
import {Tags} from "./card-sections/Tags";
import {TripIcon} from "./card-sections/TripIcon";
import {WarningIcon} from "./card-sections/WarningIcon";
import {SchedulerCardProps} from "./schedulerCardContent.types";

/**
 * Base presentational component for all cards displayed on the scheduler
 */

export function SchedulerCardContent({
    displayInTimeLine,
    ...props
}: SchedulerCardProps & {displayInTimeLine?: boolean}) {
    return displayInTimeLine ? (
        <SchedulerCardContentInTimeline {...props} />
    ) : (
        <SchedulerCardContentInSchedulerByDay {...props} />
    );
}

export function SchedulerCardContentInSchedulerByDay({
    name,
    decoration,
    activities,
    means,
    requestedVehicles,
    instructions,
    cardDateRange,
    schedulerStartDate,
    schedulerEndDate,
    isPreparedTrip,
    height,
    viewMode,
    isSelected,
    isFiltered,
    width,
    "data-testid": dataTestId,
    settings,
    inconsistentOrder,
    tags,
    stickyContent,
}: SchedulerCardProps) {
    const selectedCardSettings = useSchedulerCardSettings();
    let schedulerCardSettings = settings ?? selectedCardSettings;

    let hasWarning =
        (viewMode === "vehicle" && !means.trucker?.display_name) ||
        (viewMode === "trucker" && !means.vehicle?.license_plate);

    const showMeans = schedulerCardSettings.display_means && viewMode !== "chartering";
    const showVehicleRequested =
        schedulerCardSettings.display_vehicle_requested && requestedVehicles.length > 0;
    const showInstructions = schedulerCardSettings.display_global_instructions && instructions;
    const showTags = schedulerCardSettings.display_tags && tags.length > 0;
    const showTagText = schedulerCardSettings.display_tag_text;

    return (
        <SchedulerCardStyle
            border={isSelected ? "2px solid" : "none"}
            borderLeft={"3px solid"}
            borderColor={decoration.color}
            isFiltered={isFiltered}
            width={width}
            height={height}
            minHeight="30px"
            data-testid={dataTestId}
            position="relative"
            stripped={decoration.strippedBackground}
            backgroundColor={decoration.backgroundColor}
            overflow="clip"
            m="2px"
        >
            <Box padding="3px 6px">
                <StickyWrapper stickyContent={stickyContent}>
                    {schedulerCardSettings.display_shipper_name && (
                        <ShipperOrTripName name={name} />
                    )}

                    {schedulerCardSettings.display_activities && (
                        <ActivityList
                            schedulerCardSettings={schedulerCardSettings}
                            activities={activities}
                            decoration={decoration}
                            cardDateRange={cardDateRange}
                            schedulerStartDate={schedulerStartDate}
                            schedulerEndDate={schedulerEndDate}
                            inconsistentOrder={inconsistentOrder}
                        />
                    )}

                    {schedulerCardSettings.display_activities &&
                        (showMeans || showInstructions || showVehicleRequested) && (
                            <Box height={`${CardLineHeight.spaceAfterActivities}px`} />
                        )}
                    {showMeans && (
                        <Means
                            means={means}
                            viewMode={viewMode}
                            schedulerCardSettings={schedulerCardSettings}
                        />
                    )}

                    {showVehicleRequested && (
                        <RequestedVehicleLabel requestedVehicles={requestedVehicles} />
                    )}
                </StickyWrapper>
                <StickyWrapper stickyContent={stickyContent}>
                    {showInstructions && <Instructions instructions={instructions} />}
                </StickyWrapper>

                <Flex position="absolute" justifyContent={"flex-end"} top={1} right={1}>
                    {isPreparedTrip && <TripIcon decoration={decoration} />}
                    {decoration.statusIcon && <StatusIcon decoration={decoration} />}
                    {hasWarning && <WarningIcon />}
                </Flex>
            </Box>
            {showTags ? (
                <Tags tags={tags} hideText={!showTagText} stickyContent={stickyContent} />
            ) : null}
        </SchedulerCardStyle>
    );
}

export function SchedulerCardContentInTimeline({
    name,
    decoration,
    activities,
    means,
    requestedVehicles,
    instructions,
    cardDateRange,
    schedulerStartDate,
    schedulerEndDate,
    isPreparedTrip,
    viewMode,
    isSelected,
    isFiltered,
    "data-testid": dataTestId,
    settings,
    tags,
    stickyContent,
    minutesScale,
    onActivityHovered,
}: Omit<SchedulerCardProps, "inconsistentOrder" | "height" | "width">) {
    const selectedCardSettings = useSchedulerCardSettings();
    let schedulerCardSettings = settings ?? selectedCardSettings;

    let hasWarning =
        (viewMode === "vehicle" && !means.trucker?.display_name) ||
        (viewMode === "trucker" && !means.vehicle?.license_plate);

    const showMeans = schedulerCardSettings.display_means && viewMode !== "chartering";
    const showVehicleRequested = schedulerCardSettings.display_vehicle_requested;
    const showInstructions = schedulerCardSettings.display_global_instructions;
    const showTags = schedulerCardSettings.display_tags && tags.length > 0;
    const showTagText = schedulerCardSettings.display_tag_text;

    return (
        <SchedulerCardStyle
            border={isSelected ? "2px solid" : "1px solid"}
            borderColor={isSelected ? decoration.color : "grey.default"}
            m={isSelected ? "2px" : "3px"}
            borderRadius={"4px"}
            isFiltered={isFiltered}
            data-testid={dataTestId}
            position="relative"
            stripped={decoration.strippedBackground}
            backgroundColor={decoration.backgroundColor}
            overflow="clip"
        >
            <HiddenContentUnderWidth width="24px">
                <Box padding="3px 6px" minHeight="26px">
                    <StickyWrapper stickyContent={stickyContent}>
                        {schedulerCardSettings.display_shipper_name && (
                            <ShipperOrTripName name={name} />
                        )}
                        {showMeans && (
                            <Means
                                means={means}
                                viewMode={viewMode}
                                schedulerCardSettings={schedulerCardSettings}
                            />
                        )}
                        {showVehicleRequested && (
                            <RequestedVehicleLabel requestedVehicles={requestedVehicles} />
                        )}
                    </StickyWrapper>
                    <StickyWrapper stickyContent={stickyContent}>
                        {showInstructions && <Instructions instructions={instructions} />}
                    </StickyWrapper>

                    <Flex position="absolute" justifyContent={"flex-end"} top={1} right={"1px"}>
                        {isPreparedTrip && <TripIcon decoration={decoration} />}
                        {decoration.statusIcon && <StatusIcon decoration={decoration} />}
                        {hasWarning && <WarningIcon />}
                    </Flex>
                </Box>
            </HiddenContentUnderWidth>
            {schedulerCardSettings.display_activities ? (
                <ActivitiesTimeline
                    activities={activities}
                    labelMode={schedulerCardSettings.activity_label_mode}
                    decoration={decoration}
                    cardDateRange={cardDateRange}
                    schedulerStartDate={schedulerStartDate}
                    schedulerEndDate={schedulerEndDate}
                    minutesScale={minutesScale}
                    onActivityHovered={onActivityHovered}
                />
            ) : (
                <Box width="100%" borderBottom="3px solid" borderColor={decoration.color} />
            )}
            {showTags ? (
                <Tags tags={tags} hideText={!showTagText} stickyContent={stickyContent} />
            ) : null}
        </SchedulerCardStyle>
    );
}

function StickyWrapper({stickyContent, children}: {stickyContent?: boolean; children: ReactNode}) {
    const resourceOffset = useResourceOffset();
    return stickyContent ? (
        <Box position="sticky" width="fit-content" left={resourceOffset} maxWidth="100%">
            {children}
        </Box>
    ) : (
        <>{children}</>
    );
}
function HiddenContentUnderWidth({width, children}: {width: string; children: ReactNode}) {
    return (
        <Box maxWidth={`max(0px, calc((100% - ${width})*9999))`} overflow="clip">
            {children}
        </Box>
    );
}
export const SchedulerCardStyle = styled(Box)<{
    isFiltered?: boolean;
    height?: number;
    stripped?: boolean;
    backgroundColor: string;
}>(({isFiltered, height, stripped, backgroundColor}) =>
    themeAwareCss({
        minHeight: height ? height + "px" : "auto",
        opacity: isFiltered ? "0.5" : "1",
        borderRadius: 1,
        fontSize: "11px",
        display: "flex",
        flex: 1,
        flexDirection: "column",
        whiteSpace: "nowrap",
        position: "relative",
        boxSizing: "border-box",
        background: stripped
            ? `linear-gradient(-45deg, transparent 12.5%, white 12.5%, white 37.5%, transparent 37.5%, transparent 62.5%, white 62.5%, white 87.5%, transparent 87.5%)`
            : backgroundColor,
        backgroundSize: stripped ? "50px 50px" : undefined,
        backgroundColor: backgroundColor,
        "&:hover": {
            boxShadow: "large",
        },
        boxShadow: "0px 1px 1px 0px #9999993d",
    })
);
