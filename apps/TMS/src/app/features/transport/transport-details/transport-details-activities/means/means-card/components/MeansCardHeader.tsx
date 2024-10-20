import {t} from "@dashdoc/web-core";
import {Flex, Icon, IconNames, Link, Text, theme} from "@dashdoc/web-ui";
import React from "react";

import {Trip} from "app/features/trip/trip.types";

import type {Activity, ActivityMeans} from "app/types/transport";

type Props = {
    means: ActivityMeans;
    activities: Activity[];
    isActivitySiteTripPrepared: boolean;
    meansUpdatesAllowed: boolean;
    isCarrierGroup: boolean;
};

export function MeansCardHeader({
    means: {trucker, vehicle, trailers, child_transport},
    activities,
    isActivitySiteTripPrepared,
    meansUpdatesAllowed,
    isCarrierGroup,
}: Props) {
    const isSubcontracted = !!child_transport;
    const hasMeans = !!trucker || !!vehicle || trailers?.length > 0;

    const relatedActivitiesText =
        activities.length > 0
            ? t("components.activitiesFromTo", {
                  smart_count: activities.length,
                  activityIndex: activities[0].index + 1,
                  firstActivityIndex: activities[0].index + 1,
                  lastActivityIndex: activities[activities.length - 1].index + 1,
              })
            : t("components.driverChange");

    let meansStatusText = "";
    let meansLinks: Array<{
        link: string;
        icon: IconNames;
        label: string;
    }> = [];

    if (isActivitySiteTripPrepared || isSubcontracted) {
        if (isActivitySiteTripPrepared && isCarrierGroup) {
            meansStatusText = t("components.means.linkedTorPreparedTrip", {
                smart_count: activities.length,
            });
            const trip = activities[0].site.trip as Pick<Trip, "uid" | "name" | "is_prepared">;
            meansLinks.push({
                link: `/app/trips/${trip.uid}/`,
                icon: "trip",
                label: t("common.trip") + " " + trip.name,
            });
        }
        if (isSubcontracted) {
            meansStatusText = t("components.means.subcontracted", {
                smart_count: activities.length,
            });
            meansLinks.push({
                link: `/app/orders/${child_transport.uid}/`,
                icon: "cart",
                label: t("transportDetails.newOrderNumber", {
                    number: child_transport.sequential_id,
                }),
            });
        }
    } else if (hasMeans) {
        meansStatusText = t("components.means.ownFleet", {
            smart_count: activities.length,
        });
    } else if (meansUpdatesAllowed) {
        meansStatusText = t("components.means.toPlanOrSubcontract");
    }

    return (
        <Flex bg="grey.light" p={2} alignItems="center" style={{gap: theme.space[3]}}>
            <Text variant="caption" data-testid="mean-card-header-text">
                {relatedActivitiesText} {meansStatusText}
            </Text>
            {meansLinks.map((link) => (
                <Link
                    key={link.link}
                    display="inline-flex"
                    href={link.link}
                    data-testid="mean-card-header-link"
                >
                    <Icon mr={1} name={link.icon} />
                    {link.label}
                </Link>
            ))}
        </Flex>
    );
}
