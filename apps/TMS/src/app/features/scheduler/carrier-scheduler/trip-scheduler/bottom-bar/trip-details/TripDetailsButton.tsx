import {t} from "@dashdoc/web-core";
import {Icon, Card, ClickableFlex, Text, Flex} from "@dashdoc/web-ui";
import React from "react";

import {tripDetailsService} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/trip-details/tripDetails.service";
import {TripLink} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/trip-details/TripLink";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {getTripDecoration} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/trip-card/tripStatus.constants";
import {Trip} from "app/features/trip/trip.types";
import {useSelector} from "app/redux/hooks";
import {getTripByUid} from "app/redux/selectors";

import {resourceService} from "../resource-details/resource.service";

type Props = {
    tripUid: string | null;
    isOpen: boolean;
    open: () => void;
    close: () => void;
    view: TripSchedulerView;
};
export function TripDetailsButton({tripUid, isOpen, open, close, view}: Props) {
    const trip: Trip | null = useSelector((state) =>
        tripUid ? getTripByUid(state, tripUid) : null
    );
    return (
        <Card width="100%" boxShadow="none" backgroundColor={trip ? "grey.light" : "grey.lighter"}>
            <ClickableFlex
                onClick={isOpen ? close : open}
                width="100%"
                data-testid={"trip-bar-button"}
                px={2}
                disabled={!tripUid}
            >
                {trip ? (
                    <TripHeader trip={trip} view={view} />
                ) : (
                    <Text variant="caption" my={2} flex={1} ellipsis>
                        {t("scheduler.bottomBar.emptyTransportInfo")}
                    </Text>
                )}
                {tripUid && (
                    <Flex alignItems="center">
                        <Icon
                            name={isOpen ? "arrowDoubleDown" : "arrowDoubleUp"}
                            scale={0.8}
                            ml={2}
                        />
                    </Flex>
                )}
            </ClickableFlex>
        </Card>
    );
}

function TripHeader({trip, view}: {trip: Trip; view: TripSchedulerView}) {
    const tripLabel = tripDetailsService.getTripOrTransportName(trip);
    const resourceLabel = resourceService.getResourceLabel(trip, view);

    return (
        <Flex alignItems="center" justifyContent="space-between" flex={1}>
            <Flex alignItems="center">
                <Text variant="caption" my={2} mr={2} ellipsis>
                    {tripLabel}
                </Text>
                <Flex onClick={(e) => e.stopPropagation()}>
                    <TripLink trip={trip} />
                </Flex>
            </Flex>
            <Flex alignItems="center">
                <Text variant="caption" my={2} mr={2} ellipsis>
                    {resourceLabel}
                </Text>
                <TripStatus trip={trip} view={view} />
            </Flex>
        </Flex>
    );
}

const TripStatus = ({trip, view}: {trip: Trip; view: TripSchedulerView}) => {
    const decoration = getTripDecoration(trip, view);
    return (
        <>
            <Flex
                width="20px"
                height="20px"
                borderRadius="50%"
                alignItems="center"
                justifyContent="center"
                backgroundColor={decoration.color}
                lineHeight="0.7em"
                fontSize="0.7em"
                mx={2}
            >
                <Icon
                    name={decoration.statusIcon ?? "calendar"}
                    color="grey.white"
                    strokeWidth={decoration.statusIconStrokeWidth ?? 2}
                />
            </Flex>
            <Text variant="caption" data-testid="trip-status" ellipsis>
                {decoration.statusLabel
                    ? t(decoration.statusLabel)
                    : t("siteStatusBadgde.planned")}{" "}
            </Text>
        </>
    );
};
