import {Flex, Text, Icon as UIIcon} from "@dashdoc/web-ui";
import {SchedulerCardSettingsData} from "dashdoc-utils";
import React from "react";

import {VehicleLabel} from "app/features/fleet/vehicle/VehicleLabel";
import {CardLineHeight} from "app/features/scheduler/carrier-scheduler/components/card-content/cardLineHeights.constants";

import {SchedulerCardProps} from "../schedulerCardContent.types";

import {TruckerIndicator} from "./indicator/TruckerIndicator";
import {VehicleIndicator} from "./indicator/VehicleIndicator";

type Props = {
    schedulerCardSettings: SchedulerCardSettingsData;
} & Pick<SchedulerCardProps, "viewMode" | "means">;
export function Means({schedulerCardSettings, viewMode, means}: Props) {
    const trailerLabel = means.trailer?.license_plate ? (
        <>
            {/* eslint-disable-next-line react/jsx-no-literals */}
            <Text color="grey.dark" variant="subcaption" lineHeight={0} px={1} flexShrink={0}>
                -
            </Text>
            <UIIcon name="trailer" mr={1} color="grey.dark" flexShrink={0} />
            <VehicleLabel
                color="grey.dark"
                variant="subcaption"
                lineHeight={0}
                vehicle={means.trailer}
            />
        </>
    ) : (
        <></>
    );
    return (
        <>
            {schedulerCardSettings.display_means && viewMode === "vehicle" && (
                <Flex overflow="hidden" height={`${CardLineHeight.means}px`}>
                    <UIIcon
                        name="trucker"
                        mr={1}
                        color={means.trucker?.pk ? "grey.dark" : "red.dark"}
                        flexShrink={0}
                    />
                    <Flex flexShrink={0}>
                        <TruckerIndicator trucker={means.trucker} />
                    </Flex>

                    {trailerLabel}
                </Flex>
            )}

            {schedulerCardSettings.display_means && viewMode === "trailer" && (
                <Flex overflow="hidden" height={`${CardLineHeight.means}px`}>
                    <UIIcon
                        name="trucker"
                        mr={1}
                        color={means.trucker?.pk ? "grey.dark" : "red.dark"}
                        flexShrink={0}
                    />
                    <Flex flexShrink={0}>
                        <TruckerIndicator trucker={means?.trucker} />
                    </Flex>

                    <Text
                        color="grey.dark"
                        variant="subcaption"
                        lineHeight={0}
                        px={1}
                        flexShrink={0}
                    >
                        -
                    </Text>

                    <UIIcon
                        name="truck"
                        mr={1}
                        color={means.vehicle?.license_plate ? "grey.dark" : "red.dark"}
                        flexShrink={0}
                    />
                    <Flex flexShrink={0}>
                        <VehicleIndicator vehicle={means.vehicle} />
                    </Flex>
                </Flex>
            )}

            {schedulerCardSettings.display_means && viewMode === "trucker" && (
                <Flex overflow="hidden" height={`${CardLineHeight.means}px`}>
                    <UIIcon
                        name="truck"
                        mr={1}
                        color={means.vehicle?.license_plate ? "grey.dark" : "red.dark"}
                        flexShrink={0}
                    />

                    <Flex flexShrink={0}>
                        <VehicleIndicator vehicle={means.vehicle} />
                    </Flex>

                    {trailerLabel}
                </Flex>
            )}
        </>
    );
}
