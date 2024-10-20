import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, NoWrap, Text} from "@dashdoc/web-ui";
import React from "react";

import {VehicleLabel} from "app/features/fleet/vehicle/VehicleLabel";
import {Decoration} from "app/features/scheduler/carrier-scheduler/carrierScheduler.types";
import {TruckerIndicator} from "app/features/scheduler/carrier-scheduler/components/card-content/card-sections/indicator/TruckerIndicator";
import {VehicleIndicator} from "app/features/scheduler/carrier-scheduler/components/card-content/card-sections/indicator/VehicleIndicator";
import {isTripActivityComplete} from "app/features/trip/trip.service";
import {CompactTrip, SimilarActivity} from "app/features/trip/trip.types";

export function TooltipStatusHeader({
    decoration,
    trip,
    inconsistentOrder,
}: {
    decoration: Decoration;
    trip: CompactTrip;
    inconsistentOrder: boolean;
}) {
    const tooltipTrucker = <TruckerIndicator trucker={trip.trucker} withWarning />;
    const tooltipVehicle = <VehicleIndicator vehicle={trip.vehicle} withWarning />;

    const tooltipTrailer = trip.trailer?.license_plate ? (
        <VehicleLabel
            color="grey.dark"
            fontSize={0}
            lineHeight={0}
            vehicle={{
                license_plate: trip.trailer.license_plate,
                fleet_number: trip.trailer.fleet_number,
            }}
        />
    ) : null;
    const tooltipHoursWarning = inconsistentOrder && (
        <Box py={2} borderTop="1px solid" borderColor="grey.light">
            <Text
                backgroundColor="yellow.ultralight"
                color="yellow.dark"
                variant="caption"
                lineHeight={0}
                p={1}
            >
                {t("scheduler.inconsistentTimeOrder")}
            </Text>
        </Box>
    );

    return (
        <>
            <Flex alignItems="center">
                <NoWrap mb={1}>
                    <Text variant="h1">
                        {trip.is_prepared
                            ? trip.name || t("common.trip")
                            : trip.activities[0].transports[0]?.shipper?.name}
                    </Text>
                </NoWrap>
                {trip.is_prepared && <Icon height="20px" name="trip" ml={3} />}
            </Flex>
            <Flex pb={2}>
                <Flex
                    width="30px"
                    flexShrink={0}
                    height="30px"
                    backgroundColor={decoration.color}
                    mr={3}
                    borderRadius={1}
                    alignItems="center"
                    justifyContent="center"
                >
                    <Icon
                        name={(decoration as Decoration).statusIcon ?? "calendar"}
                        color="grey.white"
                        strokeWidth={(decoration as Decoration).statusIconStrokeWidth ?? 2}
                    />
                </Flex>
                <Box>
                    <Text variant="caption" lineHeight={0}>
                        {decoration.statusLabel
                            ? t(decoration.statusLabel)
                            : // eslint-disable-next-line react/jsx-no-literals
                              t("siteStatusBadgde.planned")}{" "}
                        - {t("common.activity")}{" "}
                        {
                            (trip.activities as Array<SimilarActivity>).filter((a) =>
                                isTripActivityComplete(a)
                            ).length
                            // eslint-disable-next-line react/jsx-no-literals
                        }
                        /{trip.activities.length}
                    </Text>
                    <Flex flexDirection="column">
                        <Flex>{tooltipTrucker}</Flex>
                        <Flex>
                            {tooltipVehicle}
                            {trip.trailer?.license_plate && (
                                // eslint-disable-next-line react/jsx-no-literals
                                <Text
                                    color="grey.dark"
                                    variant="subcaption"
                                    lineHeight={0}
                                    marginX={1}
                                >
                                    -
                                </Text>
                            )}
                            {tooltipTrailer}
                        </Flex>
                    </Flex>
                </Box>
            </Flex>
            {tooltipHoursWarning}
        </>
    );
}
