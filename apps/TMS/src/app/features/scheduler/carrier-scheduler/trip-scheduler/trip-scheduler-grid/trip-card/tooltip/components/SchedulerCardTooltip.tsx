import {useTimezone} from "@dashdoc/web-common";
import {getLoadText, t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import {DateAndTime} from "@dashdoc/web-ui";
import React from "react";

import {ActivityMarker} from "app/features/maps/marker/activity-marker";
import {getActivityDatesDisplay} from "app/features/scheduler/carrier-scheduler/components/card-content/card-sections/activities/by-day/SiteDate";
import {
    getActivityLoadSummary,
    getActivityLoadsList,
    getActivityStatus,
} from "app/features/trip/trip.service";
import {CompactTrip} from "app/features/trip/trip.types";

export function SchedulerCardTooltip({
    trip,
    showLoadDetails = false,
}: {
    trip: CompactTrip;
    showLoadDetails?: boolean;
}) {
    const timezone = useTimezone();
    return (
        <>
            {trip.activities.map((activity) => {
                const {start, end} = getActivityDatesDisplay(activity, timezone);
                const address = activity.address;

                const detailedLoads = getActivityLoadsList(activity);
                const isMultipleRounds =
                    activity.deliveries_from?.[0]?.multiple_rounds ||
                    activity.deliveries_to?.[0]?.multiple_rounds;
                const isTripStartOrEnd =
                    activity.category === "trip_start" || activity.category === "trip_end";

                const loads =
                    showLoadDetails || (isMultipleRounds && detailedLoads.length > 1) ? (
                        <Box mt={1}>
                            {detailedLoads.map((load, index) => (
                                <Text
                                    as="li"
                                    key={index}
                                    color="grey.dark"
                                    variant="subcaption"
                                    lineHeight={0}
                                >
                                    {" "}
                                    {getLoadText(load)}
                                </Text>
                            ))}
                        </Box>
                    ) : (
                        <Text color="grey.dark" variant="subcaption" mt={1} lineHeight={0}>
                            {getActivityLoadSummary(activity, t)}
                        </Text>
                    );
                return (
                    <Flex key={activity.uid} mb={2}>
                        <ActivityMarker
                            activityStatus={getActivityStatus(activity)}
                            category={activity.category}
                            showCategoryIcon
                            flexShrink={0}
                        />
                        <Box ml={2}>
                            {address ? (
                                <>
                                    <Text variant="captionBold">{address.name}</Text>
                                    <Text color="grey.dark" variant="caption" lineHeight={0}>
                                        {address.address} {address.postcode} {address.city},{" "}
                                        {address.country}
                                    </Text>
                                </>
                            ) : (
                                <Text variant="captionBold">
                                    {activity.category === "trip_start"
                                        ? t("trip.tripStart")
                                        : activity.category === "trip_end"
                                          ? t("trip.tripEnd")
                                          : t("common.unspecified")}
                                </Text>
                            )}
                            {start && (
                                <Text color="grey.dark" variant="subcaption" lineHeight={0}>
                                    <DateAndTime
                                        zonedDateTimeMin={start}
                                        zonedDateTimeMax={end}
                                        wrap={false}
                                    />
                                </Text>
                            )}
                            {!isTripStartOrEnd && loads}
                        </Box>
                    </Flex>
                );
            })}
        </>
    );
}
