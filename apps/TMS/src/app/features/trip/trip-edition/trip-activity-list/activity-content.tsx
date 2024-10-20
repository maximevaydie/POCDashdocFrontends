import {addressDisplayService, getCompanyAndAddressName, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Badge, Box, Flex, Icon, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {DateAndTime} from "@dashdoc/web-ui";
import {
    getSiteZonedAskedDateTimes,
    getSiteZonedRealDateTimes,
    parseAndZoneDate,
} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {ActivityMarker, getActivityStatusColor} from "app/features/maps/marker/activity-marker";
import {BookingIcon} from "app/features/transport/transports-list/BookingIcon";
import {
    getActivityKeyLabel,
    getActivityPlannedLoadSummary,
    getActivityStatus,
} from "app/features/trip/trip.service";
import {
    SimilarActivityWithTransportData,
    TransportBadgeVariant,
} from "app/features/trip/trip.types";

import type {Site} from "app/types/transport";

const HoursWarningIcon: FunctionComponent = () => (
    <TooltipWrapper content={t("trip.inconsistentScheduledAskedHours")}>
        <Icon
            name="clock"
            color="yellow.dark"
            mx={1}
            scale={[0.7, 0.7]}
            backgroundColor="yellow.ultralight"
            p="2px"
            lineHeight={"0px"}
            borderRadius="50%"
        />
    </TooltipWrapper>
);

export const ActivityContent: FunctionComponent<{
    activity: SimilarActivityWithTransportData;
    index: number | "multiple" | "similar";
    numberOfActivities: number;
    linkedToSimilar: "first" | "middle" | "last" | null;
    getBadgeVariantByTransportUid: (transportUid: string) => TransportBadgeVariant;
}> = ({activity, index, numberOfActivities, linkedToSimilar, getBadgeVariantByTransportUid}) => {
    const timezone = useTimezone();

    const askedZoned = getSiteZonedAskedDateTimes(activity, timezone);
    const realZoned = getSiteZonedRealDateTimes(activity as unknown as Site, timezone);
    const scheduledStartDate = activity.scheduled_range?.start
        ? parseAndZoneDate(activity.scheduled_range.start, timezone)
        : null;
    const scheduledEndDate = activity.scheduled_range?.end
        ? parseAndZoneDate(activity.scheduled_range.end, timezone)
        : null;

    const addressToDisplay = addressDisplayService.getActivityAddressLabel(activity.address);

    // Remove seconds and millisecons, workaround to fix inconsistent hours
    const zonedStart = askedZoned.zonedStart
        ? new Date(
              askedZoned.zonedStart.getTime() -
                  askedZoned.zonedStart.getMilliseconds() -
                  askedZoned.zonedStart.getSeconds() * 1000
          )
        : null;
    const zonedEnd = askedZoned.zonedEnd
        ? new Date(
              askedZoned.zonedEnd.getTime() -
                  askedZoned.zonedEnd.getMilliseconds() -
                  askedZoned.zonedEnd.getSeconds() * 1000
          )
        : null;

    const inconsistentScheduledAskedDates =
        activity.scheduled_range?.start &&
        activity.scheduled_range?.end &&
        zonedStart &&
        zonedEnd &&
        ((scheduledStartDate && scheduledStartDate < zonedStart) ||
            (scheduledEndDate && scheduledEndDate > zonedEnd));

    const activityStatus = getActivityStatus(activity);
    const addressName = activity.address ? getCompanyAndAddressName(activity.address) : undefined;

    return (
        <Flex
            position="relative"
            alignItems="center"
            flex={1}
            my={-2}
            py={2}
            data-testid={"trip-activity-item" + index}
        >
            {linkedToSimilar && (
                <Box
                    height={["first", "last"].includes(linkedToSimilar) ? "50%" : "100%"}
                    position="absolute"
                    width="1px"
                    bg={getActivityStatusColor(activityStatus)?.borderColor || "blue.default"}
                    bottom={linkedToSimilar === "last" ? "50%" : 0}
                    left="1.15em"
                ></Box>
            )}
            <Box zIndex="level1">
                <ActivityMarker
                    activityStatus={activityStatus}
                    activityIndex={
                        ["multiple", "similar"].includes(index as string)
                            ? index
                            : (index as number) + 1
                    }
                    category={activity.category}
                    hasBackground={activityStatus !== "not_started" || linkedToSimilar === "first"}
                />
            </Box>
            <Box flex={5} ml={3}>
                <Flex>
                    <Text
                        fontWeight="bold"
                        fontSize={2}
                        color={addressName ? "grey.ultradark" : "red.dark"}
                    >
                        {addressName ?? t("components.addressNotProvided")}
                    </Text>
                    {activityStatus === "cancelled" && (
                        <Badge variant="error" shape="squared" ml={3}>
                            {t("components.cancelled")}
                        </Badge>
                    )}
                    {activityStatus === "deleted" && (
                        <Badge variant="error" shape="squared" ml={3}>
                            {t("common.deleted.male")}
                        </Badge>
                    )}
                    {numberOfActivities === 1 &&
                        !["cancelled", "deleted"].includes(activityStatus as string) && (
                            <Badge
                                shape="squared"
                                ml={3}
                                variant={
                                    activity.transports.length > 0
                                        ? getBadgeVariantByTransportUid(activity.transports[0].uid)
                                        : "neutral"
                                }
                            >
                                {getActivityKeyLabel(activity.category)}
                                {activity.transports.length > 0 &&
                                    ` # ${activity.transports[0].sequential_id
                                        .toString()
                                        .slice(-3)}`}
                            </Badge>
                        )}
                </Flex>
                <Text variant="caption" color="grey.dark" mb={1}>
                    {addressToDisplay}
                </Text>
                <Text variant="subcaption" color="grey.dark">
                    {getActivityPlannedLoadSummary(activity, t)}
                </Text>
            </Box>
            <Flex flexDirection={"column"} flex={3} height="100%" justifyContent="space-between">
                <Text
                    color="grey.dark"
                    textAlign="end"
                    variant="caption"
                    data-testid="activity-card-dates"
                >
                    <DateAndTime
                        zonedDateTimeMin={
                            realZoned.zonedStart ?? scheduledStartDate ?? askedZoned.zonedStart
                        }
                        zonedDateTimeMax={
                            realZoned.zonedEnd ?? scheduledEndDate ?? askedZoned.zonedEnd
                        }
                        wrap={false}
                    />
                </Text>
                {numberOfActivities > 1 && (
                    <Flex flex={1} justifyContent={"flex-end"} alignItems={"flex-end"}>
                        <Badge variant="neutral">
                            {numberOfActivities + " " + t("common.activities")}
                        </Badge>
                    </Flex>
                )}
                {activity.is_booking_needed && (
                    <Flex flex={1} justifyContent={"flex-end"} alignItems={"flex-end"}>
                        <BookingIcon />
                    </Flex>
                )}
                {numberOfActivities === 1 && inconsistentScheduledAskedDates && (
                    <Flex flex={1} justifyContent={"flex-end"} alignItems={"flex-end"}>
                        <HoursWarningIcon />
                    </Flex>
                )}
            </Flex>
        </Flex>
    );
};
