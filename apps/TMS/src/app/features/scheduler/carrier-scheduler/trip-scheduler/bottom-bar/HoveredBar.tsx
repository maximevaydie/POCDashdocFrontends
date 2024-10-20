import {getCompanyAndAddressName, getAddressShortLabel, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Card, Flex, Text, Icon} from "@dashdoc/web-ui";
import {TransportAddress, formatDate} from "dashdoc-utils";
import React from "react";

import {getActivityDatesDisplay} from "app/features/scheduler/carrier-scheduler/components/card-content/card-sections/activities/by-day/SiteDate";
import {siteTypeIcons} from "app/features/scheduler/carrier-scheduler/components/card-content/status.constants";
import {
    formatEstimatedDrivingTime,
    getActivityKeyLabel,
    getActivityLoadSummary,
    getFirstActivity,
    getLastActivity,
} from "app/features/trip/trip.service";
import {SimilarActivity} from "app/features/trip/trip.types";
import {useSelector} from "app/redux/hooks";
import {getCompactTripByUid, getTripByUid} from "app/redux/selectors";

type Props = {
    tripUid: string | null;
    activityUidAndNumber: {uid: string; count: number} | null;
};
export function HoveredBar({tripUid, activityUidAndNumber}: Props) {
    return activityUidAndNumber && tripUid ? (
        <ActivityBar tripUid={tripUid} activityUidAndNumber={activityUidAndNumber} />
    ) : (
        <TripBar tripUid={tripUid} />
    );
}

function TripBar({tripUid}: Pick<Props, "tripUid">) {
    const trip = useSelector((state) => (tripUid ? getTripByUid(state, tripUid) : null));
    if (!trip) {
        return (
            <Card
                boxShadow="none"
                backgroundColor="grey.lighter"
                width="100%"
                p={2}
                alignItems="center"
                display="flex"
                data-testid="hover-bar"
            >
                <Text variant="caption" ellipsis>
                    {t("scheduler.hoverCardToGetMoreInfo")}
                </Text>
            </Card>
        );
    }
    const startAddress = getFirstActivity(trip).address;
    const endAddress = getLastActivity(trip).address;

    const tripDuration =
        trip.estimated_driving_time != null
            ? formatEstimatedDrivingTime(trip.estimated_driving_time)
            : "--";

    const tripDistance =
        trip.estimated_distance != null
            ? trip.estimated_distance + " " + t("pricingMetrics.unit.distance.short")
            : "--";
    return (
        <Card
            boxShadow="none"
            backgroundColor="grey.light"
            width="100%"
            p={2}
            alignItems="center"
            display="flex"
            data-testid="hover-bar"
        >
            <Text flex={1} variant="caption" ellipsis>
                {t("scheduler.hoverBar.tripStart")} {getAddressLabel(startAddress)}
            </Text>
            <Text flex={1} variant="caption" ellipsis>
                {t("scheduler.hoverBar.tripEnd")} {getAddressLabel(endAddress)}
            </Text>
            <Text variant="caption" ellipsis>
                {tripDistance} - {tripDuration}
            </Text>
        </Card>
    );
}
function ActivityBar({
    tripUid,
    activityUidAndNumber: {uid: activityUid, count},
}: {
    tripUid: string;
    activityUidAndNumber: {uid: string; count: number};
}) {
    return (
        <Card backgroundColor="grey.light" width="100%" p={2} alignItems="center" display="flex">
            {count > 1 ? (
                <Text variant="caption">
                    {t("trip.addSelectedActivitiesNumber", {smart_count: count})}
                </Text>
            ) : (
                <ActivityDetails tripUid={tripUid} activityUid={activityUid} />
            )}
        </Card>
    );
}
function ActivityDetails({tripUid, activityUid}: {tripUid: string; activityUid: string}) {
    const timezone = useTimezone();
    const trip = useSelector((state) => getCompactTripByUid(state, tripUid));
    const activity = trip?.activities.find((a) => a.uid === activityUid);
    if (!activity) {
        return null;
    }
    return (
        <>
            {activity.category && (
                <Flex mr={3}>
                    <Text variant="caption" ellipsis>
                        {getActivityKeyLabel(activity.category)}
                    </Text>
                    <Icon name={siteTypeIcons[activity.category]} ml={1} />
                </Flex>
            )}
            <Text variant="caption" ellipsis mr={3}>
                {getActivityDate(activity, timezone)}
            </Text>
            <Text flex={1} variant="caption" ellipsis mr={1}>
                {getAddressLabel(activity.address)}
            </Text>
            <Text flex={1} variant="caption" ellipsis>
                {getActivityLoadSummary(activity, t)}
            </Text>
        </>
    );
}

function getAddressLabel(address: TransportAddress | null) {
    return address
        ? getCompanyAndAddressName(address) + " - " + getAddressShortLabel(address)
        : "";
}

function getActivityDate(activity: SimilarActivity, timezone: string) {
    const {start, end} = getActivityDatesDisplay(activity, timezone);
    const startTime = formatDate(start, "p");
    const startEnd = formatDate(end, "p");
    return startTime === startEnd ? startTime : startTime + " - " + startEnd;
}
