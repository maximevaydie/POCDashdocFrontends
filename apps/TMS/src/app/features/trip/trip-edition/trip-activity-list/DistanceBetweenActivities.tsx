import {useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex, Text, TooltipWrapper} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {AddBreakToTripButton} from "app/features/trip/trip-edition/trip-activity-list/AddBreakToTripButton";
import {formatEstimatedDrivingTime} from "app/features/trip/trip.service";
import {SimilarActivityWithTransportData} from "app/features/trip/trip.types";

export const DistanceBetweenActivities: FunctionComponent<{
    activity: SimilarActivityWithTransportData;
    tripUid: string;
    canAddBreak: boolean;
    nextActivityUid: string | null;
}> = ({activity, tripUid, canAddBreak, nextActivityUid}) => {
    const hasAddBreakToTripEnabled = useFeatureFlag("addBreakToTrip");
    const estimatedDistance = activity.estimated_distance_to_next_trip_activity;
    const estimatedDrivingTime = activity.estimated_driving_time_to_next_trip_activity;
    return (
        <Flex flexDirection="row" alignItems="center" mb={-3}>
            <Flex
                bg="grey.light"
                width="60%"
                mx="20%"
                justifyContent="center"
                alignItems="center"
                flex={1}
                height="1.5em"
            >
                {estimatedDistance != null ? (
                    <Text color="grey.dark" variant="caption">
                        {estimatedDistance} {t("pricingMetrics.unit.distance.short")}
                    </Text>
                ) : (
                    <TooltipWrapper content={t("trip.noEstimatedDistance")}>
                        <Text color="grey.dark" variant="caption" width="100%" textAlign="center">
                            {"?" /* eslint-disable-line react/jsx-no-literals */}
                        </Text>
                    </TooltipWrapper>
                )}
                <Text color="grey.dark" variant="caption">
                    &nbsp;{"-" /* eslint-disable-line react/jsx-no-literals */}&nbsp;
                </Text>
                {estimatedDrivingTime != null ? (
                    <Text color="grey.dark" variant="caption">
                        {formatEstimatedDrivingTime(estimatedDrivingTime)}
                    </Text>
                ) : (
                    <TooltipWrapper content={t("trip.noEstimatedDrivingTime")}>
                        <Text color="grey.dark" variant="caption" width="100%" textAlign="center">
                            {"?" /* eslint-disable-line react/jsx-no-literals */}
                        </Text>
                    </TooltipWrapper>
                )}
            </Flex>
            {hasAddBreakToTripEnabled && (
                <Flex>
                    <AddBreakToTripButton
                        tripUid={tripUid}
                        canAddBreak={canAddBreak}
                        activityAfterBreakUid={nextActivityUid}
                    />
                </Flex>
            )}
        </Flex>
    );
};
