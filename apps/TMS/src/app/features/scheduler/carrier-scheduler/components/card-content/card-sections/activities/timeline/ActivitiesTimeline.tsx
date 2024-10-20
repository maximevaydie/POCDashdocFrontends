import {useTimezone} from "@dashdoc/web-common";
import {Box, Flex, Icon, Text, themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {SchedulerCardSettingsData, zoneDateToISO} from "dashdoc-utils";
import React, {useMemo} from "react";

import {Decoration} from "app/features/scheduler/carrier-scheduler/carrierScheduler.types";
import {activityTimelineService} from "app/features/scheduler/carrier-scheduler/components/card-content/card-sections/activities/timeline/activityTimeline.service";
import {getActivityKeyLabel} from "app/features/trip/trip.service";

import {SchedulerCardProps} from "../../../schedulerCardContent.types";
import {SchedulerActivitiesForCard} from "../cardActivity.types";
import {CardAddressText} from "../CardAddressText";

import {ActivityTimelineIcon} from "./ActivityTimelineIcon";

type Props = Pick<
    SchedulerCardProps,
    | "activities"
    | "decoration"
    | "cardDateRange"
    | "schedulerStartDate"
    | "schedulerEndDate"
    | "minutesScale"
    | "onActivityHovered"
> & {cardWidth?: number; labelMode: SchedulerCardSettingsData["activity_label_mode"]};
export function ActivitiesTimeline({
    activities,
    decoration,
    cardDateRange,
    schedulerStartDate,
    schedulerEndDate,
    minutesScale = 15,
    onActivityHovered,
    labelMode,
}: Props) {
    const timezone = useTimezone();
    const schedulerStart = zoneDateToISO(schedulerStartDate as Date, timezone);
    const schedulerEnd = zoneDateToISO(schedulerEndDate as Date, timezone);

    const visibleCardDateRange = useMemo(
        () => ({
            start: cardDateRange.start < schedulerStart ? schedulerStart : cardDateRange.start,
            end: cardDateRange.end > schedulerEnd ? schedulerEnd : cardDateRange.end,
        }),
        [cardDateRange.end, cardDateRange.start, schedulerEnd, schedulerStart]
    );
    const cardWidth = useMemo(
        () => activityTimelineService.getDurationWidth(visibleCardDateRange, minutesScale),
        [visibleCardDateRange, minutesScale]
    );
    const formattedActivities = useMemo(() => {
        return activityTimelineService.formatActivitiesInTimeline(
            activities,
            cardDateRange,
            visibleCardDateRange,
            minutesScale
        );
    }, [activities, cardDateRange, minutesScale, visibleCardDateRange]);

    return (
        <Box pb={1} backgroundColor="grey.white" position="relative">
            <Timeline
                decoration={decoration}
                startBefore={cardDateRange.start < schedulerStart}
                endAfter={cardDateRange.end > schedulerEnd}
            />
            <Flex minHeight="35px">
                {formattedActivities.map(
                    (
                        {
                            activity,
                            width,
                            leftOffset,
                            inconsistentDateOrder,
                            inconsistentAskedDate,
                            mergedCount,
                        },
                        index
                    ) => {
                        const icon = (
                            <ActivityTimelineIcon
                                activity={activity}
                                color={decoration.color}
                                backgroundColor={decoration.backgroundColor}
                                warning={inconsistentAskedDate}
                                error={inconsistentDateOrder}
                                label={
                                    mergedCount > 1 ? (
                                        <Text color="inherit" fontSize={0}>
                                            {mergedCount}
                                        </Text>
                                    ) : undefined
                                }
                            />
                        );
                        const address = activity.address ? (
                            <ActivityAddress address={activity.address} labelMode={labelMode} />
                        ) : (
                            <ActivityCategory category={activity.category} />
                        );
                        const isLastActivity =
                            index === formattedActivities.length - 1 &&
                            formattedActivities.length > 1;

                        if (
                            isLastActivity &&
                            activityTimelineService.isWidthTooSmallToDisplay(width, cardWidth)
                        ) {
                            const activityWidth = activityTimelineService.getActivityWidth(
                                width,
                                cardWidth
                            );
                            const previousActivityWidth = activityTimelineService.getActivityWidth(
                                formattedActivities[formattedActivities.length - 2].width,
                                cardWidth
                            );
                            return (
                                <ActivityWrapper
                                    key={index}
                                    flexDirection="column"
                                    width={`${width}%`}
                                    marginLeft={`${leftOffset}%`}
                                    zIndex="level0"
                                >
                                    <Flex ml={activityWidth < 14 ? "-16px" : -2} zIndex="level0">
                                        {icon}
                                    </Flex>
                                    <Box
                                        onMouseEnter={() =>
                                            onActivityHovered?.({
                                                uid: activity.uid,
                                                count: mergedCount,
                                            })
                                        }
                                        onMouseLeave={() => onActivityHovered?.(null)}
                                        id="activity-address"
                                        width={`${activityWidth + previousActivityWidth / 2}px`}
                                        ml={`-${previousActivityWidth / 2}px`}
                                        textAlign="end"
                                        pr={1}
                                        backgroundColor="grey.white"
                                    >
                                        {address}
                                    </Box>
                                </ActivityWrapper>
                            );
                        }
                        const isFirstActivity = index === 0;
                        const isSecondLastActivity = index === formattedActivities.length - 2;
                        const lastActivityWidth =
                            formattedActivities[formattedActivities.length - 1].width;

                        return (
                            <ActivityWrapper
                                key={index}
                                flexDirection="column"
                                width={`${width}%`}
                                marginLeft={`${leftOffset}%`}
                                position="relative"
                            >
                                <Box ml={isFirstActivity ? "3px" : -2} zIndex="level0">
                                    {icon}
                                </Box>

                                <Box
                                    id="activity-address"
                                    onMouseEnter={() =>
                                        onActivityHovered?.({
                                            uid: activity.uid,
                                            count: mergedCount,
                                        })
                                    }
                                    onMouseLeave={() => onActivityHovered?.(null)}
                                    width={
                                        isSecondLastActivity &&
                                        activityTimelineService.isWidthTooSmallToDisplay(
                                            lastActivityWidth,
                                            cardWidth
                                        )
                                            ? "50%"
                                            : "100%"
                                    }
                                >
                                    {address}
                                </Box>
                            </ActivityWrapper>
                        );
                    }
                )}
            </Flex>
        </Box>
    );
}
const ActivityWrapper = styled(Flex)(() =>
    themeAwareCss({
        "&:hover > #activity-address": {
            mt: "-13px",
            pt: "10px",
            backgroundColor: "grey.light",
            borderTop: "3px solid",
            borderColor: "grey.ultradark",
        },
    })
);
function ActivityAddress({
    address,
    labelMode,
}: {
    address: SchedulerActivitiesForCard["address"];
    labelMode: SchedulerCardSettingsData["activity_label_mode"];
}) {
    const showName = labelMode.includes("name");
    const showCity = labelMode.includes("city");
    return (
        <Box pr={1}>
            {showName && (
                <Text variant="subcaption" ellipsis>
                    {address?.name ?? ""}
                </Text>
            )}
            {showCity && (
                <Text variant="subcaption" ellipsis>
                    <CardAddressText address={address} maxLength={25} />
                </Text>
            )}
        </Box>
    );
}
function ActivityCategory({category}: {category: SchedulerActivitiesForCard["category"]}) {
    return (
        <Box pr={1}>
            <Text variant="subcaption" ellipsis fontStyle="italic">
                {getActivityKeyLabel(category)}
            </Text>
        </Box>
    );
}

function Timeline({
    decoration,
    startBefore,
    endAfter,
}: {
    decoration: Decoration;
    startBefore: boolean;
    endAfter: boolean;
}) {
    return (
        <>
            <Box
                width="100%"
                height="8px"
                mb="-8px"
                backgroundColor={decoration.backgroundColor}
            />
            <Box
                width="100%"
                borderBottom="3px solid"
                borderColor={decoration.color}
                mt={2}
                mb={"-10px"}
            >
                {startBefore && (
                    <Flex
                        position="absolute"
                        left="-14px"
                        borderRadius="50%"
                        backgroundColor={decoration.darkerBackground}
                        height="32px"
                        width="32px"
                        mt="-15px"
                        zIndex={1}
                    >
                        <Icon ml="50%" color={decoration.color} name="thickArrowLeft" />
                    </Flex>
                )}
                {endAfter && (
                    <Flex
                        position="absolute"
                        right="-14px"
                        borderRadius="50%"
                        backgroundColor={decoration.darkerBackground}
                        height="32px"
                        width="32px"
                        mt="-15px"
                        p={1}
                        zIndex={1}
                    >
                        <Icon mr="50%" color={decoration.color} name="thickArrowRight" />
                    </Flex>
                )}
            </Box>
        </>
    );
}
