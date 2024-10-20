import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Text} from "@dashdoc/web-ui";
import {MeansCombination} from "dashdoc-utils";
import React from "react";

import MeansCombinationDetails from "app/features/fleet/means-combination/MeansCombinationDetails";

interface MeansCombinationWithHighlight extends MeansCombination {
    highlightTrailer?: boolean;
    highlightTrucker?: boolean;
    highlightVehicle?: boolean;
}

interface MeansCombinationReplacementWarningProps {
    truckerExistingCombination: MeansCombination | null;
    trailerExistingCombination: MeansCombination | null;
    vehicleExistingCombination: MeansCombination | null;
}

export default function MeansCombinationReplacementWarning({
    truckerExistingCombination,
    trailerExistingCombination,
    vehicleExistingCombination,
}: MeansCombinationReplacementWarningProps) {
    const affectedCombinations = [
        ...(truckerExistingCombination
            ? [
                  {
                      ...truckerExistingCombination,
                      highlightTrucker: true,
                  },
              ]
            : []),
        ...(vehicleExistingCombination
            ? [
                  {
                      ...vehicleExistingCombination,
                      highlightVehicle: true,
                  },
              ]
            : []),
        ...(trailerExistingCombination
            ? [
                  {
                      ...trailerExistingCombination,
                      highlightTrailer: true,
                  },
              ]
            : []),
    ];

    return (
        <Box
            backgroundColor="yellow.ultralight"
            padding={4}
            marginTop={6}
            data-testid="means-combinations-replacement-warning"
        >
            <Flex marginBottom={3}>
                <Icon name="warning" color="yellow.dark" />
                <Text ml={2} lineHeight="inherit">
                    {t("fleet.meansCombinations.warning.meansExistsInOtherCombinations")}
                </Text>
            </Flex>
            <Flex flexDirection="column" css={{gap: "12px"}}>
                {mergeDuplicates(affectedCombinations).map(
                    (meansCombinationWithHighlight, index) => {
                        return (
                            <MeansCombinationDetails
                                key={index}
                                meansCombination={meansCombinationWithHighlight}
                                highlightTrailerInRed={
                                    meansCombinationWithHighlight.highlightTrailer
                                }
                                highlightTruckerInRed={
                                    meansCombinationWithHighlight.highlightTrucker
                                }
                                highlightVehicleInRed={
                                    meansCombinationWithHighlight.highlightVehicle
                                }
                            />
                        );
                    }
                )}
            </Flex>
        </Box>
    );

    function mergeDuplicates(
        combinations: Array<MeansCombinationWithHighlight>
    ): Array<MeansCombinationWithHighlight> {
        // If there are two combinations (max count) with the same pk, we merge them into one.
        if (combinations.length === 2 && combinations[0].pk === combinations[1].pk) {
            return [
                {
                    ...combinations[0],
                    highlightTrailer:
                        combinations[0].highlightTrailer || combinations[1].highlightTrailer,
                    highlightTrucker:
                        combinations[0].highlightTrucker || combinations[1].highlightTrucker,
                    highlightVehicle:
                        combinations[0].highlightVehicle || combinations[1].highlightVehicle,
                },
            ];
        }

        return combinations;
    }
}
