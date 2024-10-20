import {useTimezone} from "@dashdoc/web-common";
import {Box, ClickableFlex, Flex, Text} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import styled from "@emotion/styled";
import {formatDate, parseAndZoneDate} from "dashdoc-utils";
import {isFuture} from "date-fns";
import React from "react";

import ActionBadge from "./action-badge";
import SiteStatusBadge, {getStatusData} from "./site-status-badge";
import {
    SiteSchedulerDelivery,
    SiteSchedulerDeliveryPlannedLoad,
    SiteSchedulerSharedActivity,
    SiteStatus,
} from "./types";

const CARD_WIDTH = 452;
const CARD_HEIGHT = 24;

const getSiteType = (siteActivity: SiteSchedulerSharedActivity) =>
    siteActivity.activities[0].category;

const getIsETAEnabledOnSite = (siteActivity: SiteSchedulerSharedActivity) =>
    siteActivity.activities[0].eta_tracking === true;

const getETA = (siteActivity: SiteSchedulerSharedActivity, timezone: string) => {
    const eta = siteActivity.activities[0].eta;
    return eta ? formatDate(parseAndZoneDate(eta, timezone), "p") : null;
};

/* According to the transport status, the fact that the ETA is enabled or not on the current site and the activity status,
 * we return the status of one or the other. */
const getSiteStatusForActivity = (
    siteActivity: SiteSchedulerSharedActivity,
    isETAEnabledOnSite: boolean
): SiteStatus => {
    const transportStatus = siteActivity.activities[0].transport.status;
    // "Annulé/Terminé"
    if (["cancelled", "done"].includes(transportStatus)) {
        return transportStatus as SiteStatus;
    }

    // "Terminé"
    const activityStatus = siteActivity.activities[0].status;
    if (["activity_done", "departed"].includes(activityStatus)) {
        return activityStatus;
    }

    const punctualityStatus = siteActivity.activities[0].punctuality_status;
    // "Retard"
    if (isETAEnabledOnSite && punctualityStatus === "late") {
        return punctualityStatus;
    }

    // "Sur site"
    if (["trucker_arrived", "on_site"].includes(activityStatus)) {
        return activityStatus;
    }

    // "À valider"
    if (["created", "updated", "unassigned"].includes(transportStatus)) {
        return transportStatus as SiteStatus;
    }

    // For the following statuses, we return "Planifié", meaning that the current activity hasn't started yet but will occur since the transport is in progress.
    if (
        activityStatus === "created" &&
        [
            "confirmed",
            "assigned",
            "sent_to_trucker",
            "planned_and_sent",
            "acknowledged",
            "on_loading_site",
            "on_unloading_site",
            "loading_complete",
            "unloading_complete",
        ].includes(transportStatus)
    ) {
        return transportStatus as SiteStatus;
    }

    // "Inconnu" (in the case where a new status were added and not handled here)
    // @ts-ignore
    return null;
};

const getDeliveriesAtSite = (siteActivity: SiteSchedulerSharedActivity) => {
    switch (getSiteType(siteActivity)) {
        case "loading":
            return siteActivity.activities[0].deliveries_from;
        case "unloading":
            return siteActivity.activities[0].deliveries_to;
        case "breaking":
        case "resuming":
            return siteActivity.activities[0].break_or_resume_activity_deliveries;
    }
};

const getSiteCities = (
    siteActivity: SiteSchedulerSharedActivity,
    deliveries: SiteSchedulerDelivery[]
) => {
    switch (getSiteType(siteActivity)) {
        // Display deliveries destination cities.
        case "loading":
            return deliveries.map((delivery) => delivery.destination.address?.city).join(", ");
        // Display deliveries origin cities.
        case "unloading":
            return deliveries.map((delivery) => delivery.origin.address?.city).join(", ");
        // Display deliveries origin and destination cities.
        case "breaking":
        case "resuming":
            return deliveries
                .map(
                    (delivery) =>
                        delivery.origin.address?.city +
                        " -> " +
                        delivery?.destination.address?.city
                )
                .join(", ");
        default:
            return "";
    }
};

const getActivityStatus = (siteActivity: SiteSchedulerSharedActivity) =>
    siteActivity.activities[0].category;

const getLoadsDescriptionsForDeliveries = (deliveries: SiteSchedulerDelivery[]): string => {
    if (!deliveries) {
        // @ts-ignore
        return null;
    }
    const descriptions = deliveries.map((delivery: SiteSchedulerDelivery) => {
        return getLoadsDescriptions(delivery.planned_loads);
    });
    return descriptions.flat().join(", ");
};

const getLoadsDescriptions = (loads: SiteSchedulerDeliveryPlannedLoad[]): string[] => {
    if (!loads) {
        return [];
    }
    const descriptions = loads.map((load: SiteSchedulerDeliveryPlannedLoad) => {
        return load.description;
    });
    return descriptions;
};

const TextContainer = styled(Box)<{status: SiteStatus; color: string}>`
    flex: 1;
    display: flex;
    margin-right: 8px;
    color: ${(props) => (props.status == "cancelled" ? props.color : "")};
    max-height: 100%;
    overflow: hidden;
    text-decoration: ${(props) => (props.status == "cancelled" ? "line-through" : "")};
    & span {
        min-width: 50px;
        max-width: 50%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        &:not(span:first-of-type):before {
            content: "- ";
        }
    }
    & span:last-of-type {
        min-width: fit-content;
    }
`;

export type SiteSchedulerCardProps = {
    onCardSelected: (siteActivity: SiteSchedulerSharedActivity) => void;
    siteActivity: SiteSchedulerSharedActivity;
    isFiltered: boolean;
    testId?: string;
};

export default function SiteSchedulerCard({
    onCardSelected,
    siteActivity,
    isFiltered,
    testId,
}: SiteSchedulerCardProps) {
    const timezone = useTimezone();
    const isETAEnabledOnSite = getIsETAEnabledOnSite(siteActivity);
    const eta = isETAEnabledOnSite === true ? getETA(siteActivity, timezone) : null;
    const status = getSiteStatusForActivity(siteActivity, isETAEnabledOnSite);

    // Do not display the ETA if the trucker is already on site
    // or if the activity/transport is done or cancelled.
    // or eta date is past
    const displayETA =
        eta &&
        !["on_site", "trucker_arrived", "activity_done", "departed", "done", "cancelled"].includes(
            status
        ) &&
        isFuture(new Date(siteActivity.activities[0].eta));

    const deliveryAction = getActivityStatus(siteActivity);
    const deliveriesAtSite = getDeliveriesAtSite(siteActivity);

    // @ts-ignore
    const siteCities = getSiteCities(siteActivity, deliveriesAtSite);
    // @ts-ignore
    const loadsDescriptions = getLoadsDescriptionsForDeliveries(deliveriesAtSite);
    // TODO: retrieve the carrier name by another way
    const carrierName = siteActivity.activities[0].transport.carrier_address?.name;

    const {backgroundColor, color} = getStatusData(status);
    return (
        <ClickableFlex
            css={
                isFiltered &&
                css`
                    opacity: 0.5;
                `
            }
            hoverStyle={{bg: "none"}}
            bg={backgroundColor}
            px={2}
            borderRadius={1}
            border={`1px solid ${status == "cancelled" ? color : "transparent"}`}
            borderLeft={`4px solid ${color}`}
            width={`${CARD_WIDTH}px`}
            height={`${CARD_HEIGHT}px`}
            alignItems="center"
            verticalAlign="center"
            justifyContent="space-between"
            boxShadow="small"
            onClick={onCardSelected.bind(undefined, siteActivity)}
            data-testid={testId}
        >
            <TextContainer status={status} color={color}>
                {loadsDescriptions && (
                    <Text as="span" mr={1}>
                        {loadsDescriptions}
                    </Text>
                )}
                {siteCities && (
                    <Text as="span" mr={1}>
                        {siteCities}
                    </Text>
                )}
                {carrierName && (
                    <Text as="span" mr={1}>
                        {carrierName}
                    </Text>
                )}
                {displayETA && (
                    <Text as="span" mr={1}>
                        ETA {eta}
                    </Text>
                )}
            </TextContainer>
            <Flex flex="0 content">
                <Box mr={2}>
                    <ActionBadge action={deliveryAction} borderColor={color} />
                </Box>
                <SiteStatusBadge status={status} />
            </Flex>
        </ClickableFlex>
    );
}
