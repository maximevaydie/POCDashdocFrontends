import {getLoadCategoryLabel, t} from "@dashdoc/web-core";
import {Box, Card, Flex, Text} from "@dashdoc/web-ui";
import {BadgeList} from "@dashdoc/web-ui";
import {PricingMetricKey, TariffGridPricingPolicy, useToggle} from "dashdoc-utils";
import React, {FC} from "react";

import {MultipleZonesBanner} from "app/features/pricing/tariff-grids/components/MultipleZonesBanner";
import {TariffGridBuildingGuide} from "app/features/pricing/tariff-grids/components/TariffGridBuildingGuide";
import {hasVersionMultipleZones} from "app/features/pricing/tariff-grids/tariffGridVersion.service";
import {getMetricLabel} from "app/services/invoicing";

import {PricingPolicyAction} from "./actions/PricingPolicyAction";
import {TariffGridTable} from "./table/TariffGridTable";
import {tariffGridService} from "./tariffGrid.service";
import {TariffGrid} from "./types";

type TariffGridProps = {
    tariffGrid: TariffGrid;
    onChange: (newTariffGrid: TariffGrid) => void;
};

export const TariffGridComponent: FC<TariffGridProps> = ({tariffGrid, onChange}) => {
    const hasMultipleZones = hasVersionMultipleZones(tariffGrid.current_version);

    const [
        displayTariffGridBuildingGuide,
        showTariffGridBuildingGuide,
        hideTariffGridBuildingGuide,
    ] = useToggle();

    return (
        <Card
            display="flex"
            flexDirection="column"
            flexGrow={1}
            flex="4 1 0"
            p={3}
            minHeight="270px"
        >
            <Text variant="h1" mb={4}>
                {tariffGrid.is_origin_or_destination === "destination"
                    ? t("tariffGrids.OriginZonesAndTariff")
                    : t("tariffGrids.DestinationZonesAndTariff")}
            </Text>
            <Flex flexDirection="column" flex="1 1 0%" minHeight="0">
                <Flex mb={4} flexDirection="row" alignItems={"center"}>
                    <BadgeList
                        values={[
                            `${getLoadCategoryLabel(tariffGrid.load_category)} – ${getMetricLabel(
                                tariffGrid.pricing_metric as PricingMetricKey
                            )}`,
                        ]}
                    />
                    <PricingPolicyAction
                        tariffGrid={tariffGrid}
                        onChange={(value: TariffGridPricingPolicy) =>
                            onChange(tariffGridService.editPricingPolicy(tariffGrid, value))
                        }
                    />
                </Flex>
                {hasMultipleZones && (
                    <MultipleZonesBanner
                        dataTestId="tariff-grid-multiple-zones-banner"
                        onClick={showTariffGridBuildingGuide}
                    />
                )}
                <Flex
                    flexDirection={"column"}
                    maxWidth={"unset"}
                    flexGrow="1"
                    flexShrink="1"
                    alignContent="start"
                    overflow="auto"
                >
                    <Box>
                        <TariffGridTable
                            tariffGrid={tariffGrid}
                            key={tariffGrid.current_version.uid}
                            tariffGridVersion={tariffGrid.current_version}
                            onChange={(newTariffGridVersion) => {
                                const newTariffGrid = {
                                    ...tariffGrid,
                                    current_version: newTariffGridVersion,
                                };
                                onChange(newTariffGrid);
                            }}
                        />
                    </Box>
                </Flex>
            </Flex>
            {displayTariffGridBuildingGuide && (
                <TariffGridBuildingGuide
                    dataTestId="tariff-grid-building-guide"
                    onClose={hideTariffGridBuildingGuide}
                />
            )}
        </Card>
    );
};
