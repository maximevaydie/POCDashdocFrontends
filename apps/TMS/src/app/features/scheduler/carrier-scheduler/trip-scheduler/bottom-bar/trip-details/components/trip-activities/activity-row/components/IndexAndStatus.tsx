import {Box, Flex, Icon, Text} from "@dashdoc/web-ui";
import React from "react";

import {Decoration} from "app/features/scheduler/carrier-scheduler/carrierScheduler.types";
import {
    ActivityTimelineIconWrapper,
    ActivityTimelineIcon,
} from "app/features/scheduler/carrier-scheduler/components/card-content/card-sections/activities/timeline/ActivityTimelineIcon";
import {
    isTripActivityOnSite,
    isTripActivityComplete,
    isTripActivityDeletedOrCancelled,
} from "app/features/trip/trip.service";
import {SimilarActivityWithTransportData} from "app/features/trip/trip.types";

export function IndexAndStatus({
    activity,
    index,
    decoration,
    linkToNextActivity,
}: {
    activity: SimilarActivityWithTransportData;
    index: number | "similar";
    decoration: Decoration;
    linkToNextActivity: boolean;
}) {
    const activityWithStatus = {
        ...activity,
        onSite: isTripActivityOnSite(activity),
        siteDone: isTripActivityComplete(activity),
        isDeletedOrCancelled: isTripActivityDeletedOrCancelled(activity),
    };
    const isSimilar = index === "similar";
    const indexLabel = isSimilar ? " " : `${index + 1}`;
    const statusIcon = isSimilar ? (
        <ActivityTimelineIconWrapper
            borderColor="grey.default"
            backgroundColor="grey.white"
            color="grey.default"
        >
            <Icon name={"address"} strokeWidth={2.8} />
        </ActivityTimelineIconWrapper>
    ) : (
        <ActivityTimelineIcon
            activity={activityWithStatus}
            color={decoration.color}
            backgroundColor={decoration.backgroundColor}
        />
    );
    return (
        <Flex height="100%" position="relative">
            <Flex
                alignItems="center"
                height="fit-content"
                width="100%"
                justifyContent="space-between"
            >
                <Box id="draggable-icon" display="none">
                    <Icon name="drag" />
                </Box>
                <Text variant="captionBold" color="grey.dark" id="activity-index">
                    {indexLabel}
                </Text>
                <Box>{statusIcon}</Box>
            </Flex>
            {isSimilar && (
                <Box
                    height="8px"
                    position="absolute"
                    top="-8px"
                    borderRight="1px solid"
                    borderColor="grey.default"
                    right="13px"
                />
            )}
            {linkToNextActivity && (
                <Box
                    height="100%"
                    position="absolute"
                    top="20px"
                    borderRight="1px solid"
                    borderColor="grey.default"
                    right="13px"
                />
            )}
        </Flex>
    );
}
