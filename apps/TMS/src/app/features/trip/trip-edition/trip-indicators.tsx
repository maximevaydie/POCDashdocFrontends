import {HasNotFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    Card,
    Flex,
    Icon,
    Select,
    ChartRow,
    Text,
    TooltipWrapper,
    VerticalBarChart,
    theme,
} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import React, {FunctionComponent} from "react";
import {OptionTypeBase} from "react-select";

import {ActivityMap} from "app/features/maps/ActivityMap";
import {ActivityMarker} from "app/features/maps/marker/activity-marker";
import {useLoadsUnits} from "app/features/trip/hook/useLoadsUnits";
import {
    formatEstimatedDrivingTime,
    getActivityStatus,
    getLoadQuantityFromActivity,
    getPositions,
} from "app/features/trip/trip.service";

import {SimilarActivity, TripWithTransportData} from "../trip.types";

const TripIndicators: FunctionComponent<{trip: TripWithTransportData}> = ({trip}) => {
    // compacted activities
    const activities = trip.activities.filter((a) => a.fakeMerged || a.similarUids.length === 0);
    const volumeUnits = activities.flatMap((activity) =>
        // @ts-ignore
        [...activity.deliveries_from, ...activity.deliveries_to].flatMap(({planned_loads}) =>
            // @ts-ignore
            planned_loads.map((l) => l.volume_display_unit)
        )
    );
    const volumeUnit = volumeUnits[0];
    const differentVolumeUnit = volumeUnits.some((v) => v !== volumeUnit);
    const {unitOptions: selectOptions, selectedUnit, setSelectedUnit} = useLoadsUnits(volumeUnit);

    const rows: ChartRow[] = activities.reduce(
        (acc: ChartRow[], activity: SimilarActivity, index: number) => {
            const previousQuantity = acc.length > 0 ? acc[acc.length - 1].values[0] : 0;
            const [total, loaded, unloaded] = getLoadQuantityFromActivity(
                activity,
                previousQuantity,
                selectedUnit
            );
            return [
                ...acc,
                {
                    label: `${index + 1}`,
                    values: [total],
                    loaded,
                    unloaded,
                },
            ] as ChartRow[];
        },
        []
    );

    const renderXTick = (tickProps: any) => {
        const {x, y, payload} = tickProps;
        const {value, offset} = payload;
        return (
            <svg x={x - offset - 12} y={y - 10} width={24} height={24}>
                <circle cx="12" cy="12" r="12" fill={theme.colors.blue.ultralight} />
                <text x={value >= 10 ? 4 : 8} y="17" fill={theme.colors.blue.dark}>
                    {value}
                </text>
            </svg>
        );
    };

    const getSiteTypeLabel = (category: string) => {
        switch (category) {
            case "loading":
                return t("common.pickup");
            case "unloading":
                return t("common.delivery");
            case "breaking":
                return t("components.break");
            case "resuming":
                return t("components.resumption");
            default:
                return "";
        }
    };

    const renderTooltip = (tooltipProps: any) => {
        const {payload, active} = tooltipProps;
        if (!active) {
            return null;
        }
        const activityIndex = Number(tooltipProps.label) - 1;
        if (activityIndex >= activities.length || activityIndex < 0) {
            return null;
        }
        const activity = activities[activityIndex];
        if (!activity) {
            return null;
        }
        const unit = selectOptions.find(({value}) => selectedUnit === value)?.unit;
        return (
            <Card bg="grey.white" boxShadow="small" p={3}>
                <Text variant="h1" mb={2}>
                    {t("common.activity") + " " + (activityIndex + 1)}{" "}
                </Text>
                <Flex mb={2}>
                    <ActivityMarker
                        activityStatus={getActivityStatus(activity)}
                        category={activity.category}
                        showCategoryIcon
                    />
                    <Text ml={2}>
                        {/*
// @ts-ignore */}
                        {getSiteTypeLabel(activity.category)}
                    </Text>
                </Flex>

                <Flex justifyContent="space-between" mb={1}>
                    <Text mr={4}>{t("trip.loadGraph.tooltip.unloaded")}</Text>
                    {
                        // eslint-disable-next-line react/jsx-no-literals
                        <Text>
                            - {payload[0].payload.unloaded} {unit}
                        </Text>
                    }
                </Flex>
                <Flex justifyContent="space-between">
                    <Text mr={4}>{t("trip.loadGraph.tooltip.loaded")}</Text>
                    {
                        // eslint-disable-next-line react/jsx-no-literals
                        <Text>
                            + {payload[0].payload.loaded} {unit}
                        </Text>
                    }
                </Flex>
                <Flex
                    justifyContent="flex-end"
                    borderTop="1px solid"
                    borderColor="grey.light"
                    width="100%"
                    mt={2}
                    pt={2}
                >
                    <Text variant="h1">
                        {payload[0].value} {unit}
                    </Text>
                </Flex>
            </Card>
        );
    };

    const title = (
        <Flex mt={5} alignItems="center">
            <Text color="grey.dark" fontWeight="600" mx={2}>
                {t("common.transportLoading")}
            </Text>
            <Box width={200}>
                <Select
                    options={selectOptions}
                    value={selectOptions.find((o) => o.value === selectedUnit)}
                    onChange={(v: OptionTypeBase) =>
                        // @ts-ignore
                        setSelectedUnit(selectOptions.find((o) => o.value === v.value).value)
                    }
                    isClearable={false}
                    data-testid="select-trip-load-graph-unit"
                />
            </Box>
        </Flex>
    );

    const partialEstimatedDistance =
        activities.length - 1 >
        activities.filter((activity) => activity.estimated_distance_to_next_trip_activity != null)
            .length;

    const partialEstimatedDrivingTime =
        activities.length - 1 >
        activities.filter(
            (activity) => activity.estimated_driving_time_to_next_trip_activity != null
        ).length;

    const positions = getPositions(activities);

    return (
        <Box display="flex" height="100%" flexDirection="column" pb={2} overflowY="auto">
            <Box minHeight="150px" flex={1 / 2}>
                <ActivityMap positions={positions} />
            </Box>
            <Flex flexDirection="column">
                <Text ml={2} mt={3} color="grey.dark" variant="h2">
                    {t("trip.indicators")}
                </Text>
                <Flex justifyContent="space-around" mt={2} mx={2} style={{gap: "8px"}}>
                    <Flex flexDirection="column" flex={1}>
                        <Text color="grey.dark">{t("trip.nbActivities")}</Text>
                        <Text variant="h2" data-testid="trip-activities-count">
                            {activities.length}
                        </Text>
                    </Flex>
                    <Flex flexDirection="column" flex={1}>
                        <Text color="grey.dark">{t("scheduler.totalRevenue")}</Text>
                        <Text variant="h2" data-testid="trip-agreed-price">
                            {trip.turnover
                                ? formatNumber(trip.turnover, {
                                      style: "currency",
                                      currency: "EUR",
                                  })
                                : "--"}
                        </Text>
                    </Flex>
                    <Flex flexDirection="column" flex={1}>
                        <Text color="grey.dark">{t("trip.turnoverPerDistance")}</Text>
                        <Flex alignItems="baseline">
                            <Text variant="h2" data-testid="trip-distance-per-km">
                                {trip.estimated_distance && trip.turnover
                                    ? formatNumber(
                                          parseFloat(trip.turnover) / trip.estimated_distance,
                                          {
                                              maximumFractionDigits: 2,
                                          }
                                      ) +
                                      " " +
                                      t("turnoverPerDistance.unit.short")
                                    : "--"}
                            </Text>
                            {partialEstimatedDistance && (
                                <TooltipWrapper content={t("trip.partialEstimatedDistance")}>
                                    <Icon name="warning" color="yellow.default" ml={2} />
                                </TooltipWrapper>
                            )}
                        </Flex>
                    </Flex>
                </Flex>
                <Flex justifyContent="space-around" mt={2} mx={2} style={{gap: "8px"}}>
                    <Flex flexDirection="column" flex={1}>
                        <Text color="grey.dark">{t("trip.estimatedDistance")}</Text>
                        <Flex alignItems="baseline">
                            <Text variant="h2" data-testid="trip-distance">
                                {trip.estimated_distance != null
                                    ? trip.estimated_distance +
                                      " " +
                                      t("pricingMetrics.unit.distance.short")
                                    : "--"}
                            </Text>
                            {partialEstimatedDistance && (
                                <TooltipWrapper content={t("trip.partialEstimatedDistance")}>
                                    <Icon name="warning" color="yellow.default" ml={2} />
                                </TooltipWrapper>
                            )}
                        </Flex>
                    </Flex>
                    <Flex flexDirection="column" flex={1}>
                        <TooltipWrapper content={t("trip.drivingTimeNotIncludeBreaks")}>
                            <Text color="grey.dark">{t("trip.estimatedDrivingTime")}</Text>
                        </TooltipWrapper>
                        <Flex alignItems="baseline">
                            <Text variant="h2" data-testid="trip-driving-time">
                                {trip.estimated_driving_time != null
                                    ? formatEstimatedDrivingTime(trip.estimated_driving_time)
                                    : "--"}
                            </Text>
                            {partialEstimatedDrivingTime && (
                                <TooltipWrapper content={t("trip.partialEstimatedDrivingTime")}>
                                    <Icon
                                        name="warning"
                                        color="yellow.default"
                                        ml={2}
                                        data-testid="trip-driving-time-warning"
                                    />
                                </TooltipWrapper>
                            )}
                        </Flex>
                    </Flex>

                    <Flex flex={1}>
                        <HasNotFeatureFlag flagName="carbonfootprintiso">
                            <Flex flexDirection="column">
                                <Text color="grey.dark">{t("trip.estimatedCarbonFootprint")}</Text>
                                <Flex alignItems="baseline">
                                    <Text variant="h2" data-testid="trip-carbon-footprint">
                                        {trip.estimated_carbon_footprint != null
                                            ? formatNumber(trip.estimated_carbon_footprint, {
                                                  maximumFractionDigits: 2,
                                              }) +
                                              " " +
                                              t("components.carbonFootprint.unit")
                                            : "--"}
                                    </Text>
                                </Flex>
                            </Flex>
                        </HasNotFeatureFlag>
                    </Flex>
                </Flex>
                <Box pb={"60px"}>
                    {selectedUnit === "volume" && differentVolumeUnit ? (
                        <Box>
                            {title}
                            <Box p={3} minHeight="200px">
                                <Callout>{t("trip.loadGraph.inconsitentVolumeUnit")}</Callout>
                            </Box>
                        </Box>
                    ) : (
                        <VerticalBarChart
                            title={title}
                            rows={rows}
                            // @ts-ignore
                            bars={[{color: theme.colors.blue.light, barSize: null}]}
                            legends={[]}
                            renderXTick={renderXTick}
                            barChartProps={{barCategoryGap: 2}}
                            // @ts-ignore
                            renderTooltip={renderTooltip}
                            height={100}
                        />
                    )}
                </Box>
            </Flex>
        </Box>
    );
};

export default TripIndicators;
