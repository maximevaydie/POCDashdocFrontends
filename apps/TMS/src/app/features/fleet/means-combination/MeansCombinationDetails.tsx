import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text} from "@dashdoc/web-ui";
import {MeansCombination} from "dashdoc-utils";
import React from "react";

interface MeansCombinationDetailsProps {
    meansCombination: MeansCombination;
    highlightTruckerInRed?: boolean;
    highlightVehicleInRed?: boolean;
    highlightTrailerInRed?: boolean;
}

export default function MeansCombinationDetails({
    meansCombination,
    highlightTrailerInRed = false,
    highlightTruckerInRed = false,
    highlightVehicleInRed = false,
}: MeansCombinationDetailsProps) {
    return (
        <Flex css={{gap: "48px"}} data-testid="means-combination-details">
            {meansCombination.trucker ? (
                <MeansItem
                    label={t("common.trucker")}
                    iconName="user"
                    value={meansCombination.trucker.display_name}
                    testId="means-combination-details-trucker"
                    highlightInRed={highlightTruckerInRed}
                />
            ) : null}

            {meansCombination.vehicle ? (
                <MeansItem
                    label={t("common.vehicle")}
                    iconName="truck"
                    value={meansCombination.vehicle.license_plate}
                    testId="means-combination-details-vehicle"
                    highlightInRed={highlightVehicleInRed}
                />
            ) : null}

            {meansCombination.trailer ? (
                <MeansItem
                    label={t("common.trailer")}
                    iconName="trailer"
                    value={meansCombination.trailer.license_plate}
                    testId="means-combination-details-trailer"
                    highlightInRed={highlightTrailerInRed}
                />
            ) : null}
        </Flex>
    );
}

interface MeansItemProps {
    label: string;
    iconName: "user" | "truck" | "trailer";
    value: string;
    testId: string;
    highlightInRed: boolean;
}

function MeansItem({label, iconName, value, testId, highlightInRed}: MeansItemProps) {
    return (
        <Flex flexDirection="column">
            <Text variant="h2">{label}</Text>
            <Flex>
                <Icon name={iconName} mr={2} color={highlightInRed ? "red.dark" : "grey.dark"} />
                <Text
                    fontWeight={highlightInRed ? "600" : "400"}
                    color={highlightInRed ? "red.dark" : "grey.dark"}
                    data-testid={testId}
                >
                    {value}
                </Text>
            </Flex>
        </Flex>
    );
}
