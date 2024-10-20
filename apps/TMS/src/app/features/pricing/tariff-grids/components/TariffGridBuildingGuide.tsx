import {t} from "@dashdoc/web-core";
import {Box, Callout, Card, ClickableFlex, Flex, IconButton, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {ZonesPrecisionSVG} from "app/features/pricing/tariff-grids/components/ZonesPrecisionSVG";

type TariffGridBuildingGuideProps = {
    dataTestId?: string;
    onClose: () => void;
};
export const TariffGridBuildingGuide = ({dataTestId, onClose}: TariffGridBuildingGuideProps) => {
    const [stepExpanded, , , toggleStepExpansion] = useToggle(false);

    return (
        <Card
            position="absolute"
            right={0}
            top={0}
            zIndex="modal"
            height="100%"
            borderRadius={0}
            data-testid={dataTestId}
            width={[240, 380]}
        >
            <Flex flexDirection="column" height="100%">
                <Flex justifyContent={"space-between"} p={4}>
                    <Text variant="title" fontWeight="600" color="grey.dark">
                        {t("tariffGrids.buildingGuide.mixMultipleZoneTypes")}
                    </Text>
                    <IconButton
                        data-testid={`${dataTestId}-close-icon-button`}
                        name="close"
                        onClick={onClose}
                    />
                </Flex>
                <Flex flexDirection="column" height="100%" overflow="auto" pb={4}>
                    <Callout variant="secondary">
                        <Text color="blue.dark">
                            {t(
                                "tariffGrids.buildingGuide.presentHowToBuildATariffGridWithMultipleZones"
                            )}
                        </Text>
                    </Callout>
                    <Flex flexDirection="column" px={5}>
                        <ClickableFlex
                            mt={4}
                            hoverStyle={{bg: "grey.ultralight"}}
                            justifyContent="space-between"
                            style={{cursor: "pointer"}}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleStepExpansion();
                            }}
                        >
                            <Text variant="h1">
                                {t("tariffGrids.buildingGuide.stepOneHowDoesItWork")}
                            </Text>
                            <IconButton name={stepExpanded ? "arrowDown" : "arrowRight"} />
                        </ClickableFlex>
                        {stepExpanded && (
                            <Box>
                                <Text variant="h2" mt={2}>
                                    {t("tariffGrids.buildingGuide.whatIsAZoneType")}
                                </Text>
                                <Text mt={2}>
                                    {t("tariffGrids.buildingGuide.zoneTypeExplanation")}
                                </Text>
                                <Text variant="h2" mt={2}>
                                    {t("tariffGrids.buildingGuide.whyMixDifferentTypeOfZones")}
                                </Text>
                                <Text mt={2}>
                                    {t(
                                        "tariffGrids.buildingGuide.combiningDifferentTypesOfZonePotential"
                                    )}
                                </Text>
                                <Callout iconDisabled variant={"informative"} mt={4}>
                                    <Text>
                                        {t(
                                            "tariffGrids.buildingGuide.addressThenCitiesAndDepartmentExample"
                                        )}
                                    </Text>
                                </Callout>
                                <Text variant="h2" mt={2}>
                                    {t("tariffGrids.buildingGuide.howGridsWorkInDashdoc")}
                                </Text>
                                <Text mt={2}>
                                    {t(
                                        "tariffGrids.buildingGuide.toApplyAGridDashdocAtCustomersTypeOfLoadsAndOriginDestinationPairs"
                                    )}
                                </Text>
                                <Text mt={2}>
                                    {t(
                                        "tariffGrids.buildingGuide.aTransportIsEligibleIfItMatchesTheCriteriaPresentInTheGridDashdocWillTakeTheFirstLine"
                                    )}
                                </Text>
                            </Box>
                        )}

                        <Text variant="h1" mt={4}>
                            {t("tariffGrids.buildingGuide.tipsAndBestPractices")}
                        </Text>
                        <Text mt={4}>{t("tariffGrids.buildingGuide.overlapExplanation")}</Text>
                        <Callout iconDisabled mt={4} variant="informative">
                            <Text>
                                {t(
                                    "tariffGrids.buildingGuide.aDepartmentMayContainsACityWhichContainsAnAddressExample"
                                )}
                            </Text>
                            <Text mt={2}>
                                {t("tariffGrids.buildingGuide.overlapConsequences")}
                            </Text>
                        </Callout>
                        <Callout icon="edit" mt={4} variant="secondary">
                            <Text color="blue.dark">
                                {t("tariffGrids.buildingGuide.importanceOfLinesPriorization")}
                            </Text>
                        </Callout>
                        <Box mt={4}>
                            <ZonesPrecisionSVG />
                        </Box>
                    </Flex>
                </Flex>
            </Flex>
        </Card>
    );
};
