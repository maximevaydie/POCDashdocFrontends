import {TranslationKeys, t} from "@dashdoc/web-core";
import {
    BarChart,
    Box,
    Card,
    Flex,
    Icon,
    PieChart,
    BarChartProps,
    PieChartProps,
    Text,
    theme,
} from "@dashdoc/web-ui";
import {DeliveriesStats, DeliveriesStatsData, formatNumber} from "dashdoc-utils";
import React, {FunctionComponent, ReactNode, useCallback, useMemo} from "react";
import {useHistory, useLocation} from "react-router";

import {
    TransportsScreenCleanedQuery,
    TransportsScreenQuery,
    TransportsScreenUpdateQuery,
} from "app/screens/transport/transports-screen/transports.types";

export const colorsAndLabelsByDataKey: Record<string, {label: TranslationKeys; fill: string}> = {
    done: {
        label: "dashboard.transports.done",
        fill: theme.colors.green.default,
    },
    cancelled: {
        label: "dashboard.transports.cancelled",
        fill: theme.colors.grey.default,
    },
    not_done: {
        label: "dashboard.transports.notDone",
        fill: theme.colors.red.default,
    },
    undisputed: {
        label: "dashboard.transports.undisputed",
        fill: theme.colors.green.default,
    },
    disputed: {
        label: "dashboard.transports.disputed",
        fill: theme.colors.red.default,
    },
    ontime: {
        label: "dashboard.transports.ontime",
        fill: theme.colors.green.default,
    },
    delayed: {
        label: "dashboard.transports.delayed",
        fill: theme.colors.red.default,
    },
    unknown: {
        label: "dashboard.transports.punctuality.unknown",
        fill: theme.colors.grey.default,
    },
    done_with_cmr_document: {
        label: "dashboard.transports.done_with_cmr_document",
        fill: theme.colors.green.default,
    },
    done_without_cmr_document: {
        label: "dashboard.transports.done_without_cmr_document",
        fill: theme.colors.red.default,
    },
    done_with_non_cmr_document: {
        label: "dashboard.transports.done_with_non_cmr_document",
        fill: theme.colors.green.default,
    },
    done_without_non_cmr_document: {
        label: "dashboard.transports.done_without_non_cmr_document",
        fill: theme.colors.red.default,
    },
};

const filtersToApplyByDataKey: Record<string, {[key: string]: boolean} | null> = {
    done: {
        is_done: true,
    },
    cancelled: {
        cancelled: true,
    },
    not_done: {
        is_done: false,
    },
    undisputed: {
        has_observations: false,
    },
    disputed: {
        has_observations: true,
    },
    done_with_cmr_document: {
        is_done: true,
        has_complete_cmr_document: true,
    },
    done_without_cmr_document: {
        is_done: true,
        has_complete_cmr_document: false,
    },
    done_with_non_cmr_document: {
        is_done: true,
        has_non_cmr_document: true,
    },
    done_without_non_cmr_document: {
        is_done: true,
        has_non_cmr_document: false,
    },
};

type PieChartData<TData extends DeliveriesStatsData> =
    | ({
          augmentedData: PieChartProps["data"];
      } & {[K in TData[0]["name"]]: number})
    | null;

export const formatPieChartData = <TData extends DeliveriesStatsData>(
    data: any[]
): PieChartData<TData> =>
    data.reduce(
        (acc, datum) => {
            acc[datum.name] = datum.value;
            acc.augmentedData.push({
                ...datum,
                dataKey: datum.name,
                fill: colorsAndLabelsByDataKey[datum.name].fill,
                name: t(
                    colorsAndLabelsByDataKey[datum.name].label,
                    {
                        smart_count: datum.value,
                    },
                    {capitalize: true}
                ),
            });
            return acc;
        },
        {augmentedData: []} as PieChartData<TData>
    );

type BarChartData<TData extends DeliveriesStatsData> = {
    augmentedData: {[K in TData[0]["name"]]: number};
} | null;

export const formatBarChartData = <TData extends DeliveriesStatsData>(
    data: any[],
    commonProperties: Record<string, unknown> = {}
): BarChartData<TData> =>
    data.reduce(
        (acc, datum) => {
            acc.augmentedData = {
                ...acc.augmentedData,
                [datum.name]: datum.value,
                ...commonProperties,
            };
            return acc;
        },
        {augmentedData: {}} as BarChartData<TData>
    );

type TransportsDashboardProps = {
    updateQuery: TransportsScreenUpdateQuery;
    renderLoading: () => ReactNode;
    renderNoResults: () => ReactNode;
    data: DeliveriesStats | null;
    baseUrl: string;
};

export const formatTimeStep = (step: string) => {
    // time setps are encoded this way:
    // _n for "less than n minutes"
    // n_ for "more than n minutes"
    // n1_n2 for "between n1 minutes and n2 minutes"

    const [nMin, nMax] = step.split("_");

    if (nMin && nMax) {
        return t("dashboard.transports.punctuality.betweenNAndNMinutes", {nMin, nMax});
    }
    if (nMin) {
        return t("dashboard.transports.punctuality.moreThanNMinutes", {n: nMin});
    }
    if (nMax) {
        return t("dashboard.transports.punctuality.lessThanNMinutes", {n: nMax});
    }
    return step;
};

export const TransportsDashboard: FunctionComponent<TransportsDashboardProps> = (props) => {
    const {data, updateQuery, renderLoading, renderNoResults, baseUrl} = props;
    const history = useHistory();
    const location = useLocation();

    // add labels and colors to data and extract needed information
    const {
        progressData,
        disputesData,
        punctualityData,
        punctualityBars,
        distributionOfDelaysData,
        distributionOfDelaysBars,
        distributionOfDurationsData,
        distributionOfDurationsBars,
        cmrDocumentsData,
        otherDocumentsData,
        numberOfTransports,
        numberOfDeliveries,
        numberOfDoneDeliveries,
        numberOfNotDoneDeliveries,
    } = useMemo(() => {
        if (!data) {
            return {};
        }

        const {
            meta: {transport_count: numberOfTransports, delivery_count: numberOfDeliveries},
        } = data;

        /**
         * Progress pie chart data
         */
        const {
            // @ts-ignore
            augmentedData: progressData,
            // @ts-ignore
            not_done: numberOfNotDoneDeliveries,
            // @ts-ignore
            done: numberOfDoneDeliveries,
        } = formatPieChartData<DeliveriesStats["progress"]>(data.progress);

        /**
         * Disputes pie chart data
         */
        // @ts-ignore
        const {augmentedData: disputesData} = formatPieChartData<DeliveriesStats["disputes"]>(
            data.disputes
        );

        /**
         * Punctuality bar chart data
         */
        // @ts-ignore
        const {augmentedData: loadingPunctualityData} = formatBarChartData<
            DeliveriesStats["loading_punctuality"]
        >(data.loading_punctuality, {
            activity: "loading",
            activityLabel: t("common.transportLoading"),
        });

        // @ts-ignore
        const {augmentedData: unloadingPunctualityData} = formatBarChartData<
            DeliveriesStats["unloading_punctuality"]
        >(data.unloading_punctuality, {
            activity: "unloading",
            activityLabel: t("common.transportUnloading"),
        });

        const punctualityData = [loadingPunctualityData, unloadingPunctualityData];

        type ActivityPunctualityDataKey = DeliveriesStats["loading_punctuality"][0]["name"];
        const punctualityBars: (BarChartProps["bars"][0] & {
            dataKey: ActivityPunctualityDataKey;
        })[] = (["ontime", "delayed", "unknown"] as ActivityPunctualityDataKey[]).map(
            (dataKey) => ({
                dataKey,
                stackId: "punctuality",
                fill: colorsAndLabelsByDataKey[dataKey].fill,
                name: t(colorsAndLabelsByDataKey[dataKey].label),
                cursor: dataKey !== "unknown" ? "pointer" : undefined,
                onClick: ({activity}) => {
                    const activityKey = activity === "loading" ? "origin" : "destination";
                    let filters: Partial<TransportsScreenCleanedQuery> = {};

                    if (dataKey === "ontime") {
                        filters[
                            `${activityKey}_arrival_delay` as
                                | "origin_arrival_delay"
                                | "destination_arrival_delay"
                        ] = "0";
                    }
                    if (dataKey === "delayed") {
                        filters[
                            `${activityKey}_arrival_delay__gt` as
                                | "origin_arrival_delay__gt"
                                | "destination_arrival_delay__gt"
                        ] = "0";
                    }

                    if (Object.keys(filters)) {
                        applyFilteredQuery(filters as TransportsScreenQuery);
                    }
                },
            })
        );

        /**
         * Distribution of delays bar chart data
         */
        // @ts-ignore
        const {augmentedData: distributionOfLoadingDelaysData} = formatBarChartData<
            DeliveriesStats["loading_delay"]
        >(data.loading_delay);

        // @ts-ignore
        const {augmentedData: distributionOfUnloadingDelaysData} = formatBarChartData<
            DeliveriesStats["unloading_delay"]
        >(data.unloading_delay);

        const distributionOfDelaysData = Object.keys(distributionOfLoadingDelaysData).map(
            (delay) => ({
                delay,
                delayLabel: formatTimeStep(delay),
                loading: distributionOfLoadingDelaysData[delay],
                unloading: distributionOfUnloadingDelaysData[delay],
            })
        );

        const distributionOfDelaysBars = ["loading", "unloading"].map((dataKey) => ({
            dataKey,
            name:
                dataKey === "loading"
                    ? t("common.transportLoading")
                    : t("common.transportUnloading"),
            cursor: "pointer",
            onClick: ({delay}: {delay: string}) => {
                const activityKey = dataKey === "loading" ? "origin" : "destination";
                const [nMin, nMax] = delay.split("_");
                let filters: Partial<TransportsScreenCleanedQuery> = {};

                if (nMin) {
                    filters[
                        `${activityKey}_arrival_delay__gt` as
                            | "origin_arrival_delay__gt"
                            | "destination_arrival_delay__gt"
                    ] = `${parseInt(nMin) * 60}`; // delays must be in seconds;
                }

                if (nMax) {
                    filters[
                        `${activityKey}_arrival_delay__lte` as
                            | "origin_arrival_delay__lte"
                            | "destination_arrival_delay__lte"
                    ] = `${parseInt(nMax) * 60}`; // delays must be in seconds;
                }

                if (Object.keys(filters)) {
                    applyFilteredQuery(filters as TransportsScreenQuery);
                }
            },
        }));

        /**
         * Distribution of loadind / unloading durations bar chart data
         */
        // @ts-ignore
        const {augmentedData: distributionOfLoadingDurationsData} = formatBarChartData<
            DeliveriesStats["loading_duration"]
        >(data.loading_duration);

        // @ts-ignore
        const {augmentedData: distributionOfUnloadingDurationsData} = formatBarChartData<
            DeliveriesStats["unloading_duration"]
        >(data.unloading_duration);

        const distributionOfDurationsData = Object.keys(distributionOfLoadingDurationsData).map(
            (duration) => ({
                duration,
                durationLabel: formatTimeStep(duration),
                loading: distributionOfLoadingDurationsData[duration],
                unloading: distributionOfUnloadingDurationsData[duration],
            })
        );

        const distributionOfDurationsBars = ["loading", "unloading"].map((dataKey) => ({
            dataKey,
            name:
                dataKey === "loading"
                    ? t("common.transportLoading")
                    : t("common.transportUnloading"),
            cursor: "pointer",
            onClick: ({duration}: {duration: string}) => {
                const [nMin, nMax] = duration.split("_");
                let filters: Partial<TransportsScreenCleanedQuery> = {};

                if (nMin) {
                    filters[
                        `${dataKey}_duration__gt` as
                            | "loading_duration__gt"
                            | "unloading_duration__gt"
                    ] = `${parseInt(nMin) * 60}`; // durations must be in seconds;
                }

                if (nMax) {
                    filters[
                        `${dataKey}_duration__lte` as
                            | "loading_duration__lte"
                            | "unloading_duration__lte"
                    ] = `${parseInt(nMax) * 60}`; // durations must be in seconds;
                }

                if (Object.keys(filters)) {
                    applyFilteredQuery(filters as TransportsScreenQuery);
                }
            },
        }));

        /**
         * With / without CMR pie chart data
         */
        // @ts-ignore
        const {augmentedData: cmrDocumentsData} = formatPieChartData<
            DeliveriesStats["cmr_document"]
        >(data.cmr_document);

        /**
         * With / without other documents pie chart data
         */
        // @ts-ignore
        const {augmentedData: otherDocumentsData} = formatPieChartData<
            DeliveriesStats["non_cmr_document"]
        >(data.non_cmr_document);

        return {
            progressData,
            disputesData,
            punctualityData,
            punctualityBars,
            distributionOfDelaysData,
            distributionOfDelaysBars,
            distributionOfDurationsData,
            distributionOfDurationsBars,
            cmrDocumentsData,
            otherDocumentsData,
            numberOfTransports,
            numberOfDeliveries,
            numberOfDoneDeliveries,
            numberOfNotDoneDeliveries,
        };
    }, [data, updateQuery]);

    const applyFilteredQuery = useCallback(
        (newQuery: TransportsScreenQuery) => {
            location.pathname = `${baseUrl}/transports/`;
            // update the browser location and let the updateQuery() method take care of GET parameters
            history["push"]({
                ...location,
            });
            newQuery = {
                ...newQuery,
                isExtendedSearch: true,
                archived: false,
                tab: "results",
            };
            updateQuery(newQuery, "push");
        },
        [updateQuery, location, history, baseUrl]
    );

    const maybeApplyFilterFromDataKey = useCallback(
        (dataKey?: string) => {
            if (dataKey) {
                const filterToApply = filtersToApplyByDataKey[dataKey];
                if (filterToApply) {
                    const newQuery = {
                        tab: "results",
                        text: [],
                        ...filterToApply,
                    } as TransportsScreenQuery;
                    applyFilteredQuery(newQuery);
                }
            }
        },
        [applyFilteredQuery]
    );

    // handle click on pie slices
    const onClickOnPieSlice = useCallback(
        ({dataKey}: {dataKey?: string}) => maybeApplyFilterFromDataKey(dataKey),
        [maybeApplyFilterFromDataKey]
    );

    // @ts-ignore
    const formatTooltipValue = (value: number, total: number = numberOfDeliveries) => {
        if (!total) {
            return formatNumber(value);
        }
        return `${formatNumber(value)} (${formatNumber(value / total, {
            style: "percent",
        })})`;
    };

    const barChartsCommonProps: Partial<BarChartProps> = {
        tooltip: {
            valueFormatter: formatTooltipValue,
        },
    };

    const pieChartsCommonProps: Partial<PieChartProps> = {
        cursor: "pointer",
        onClick: onClickOnPieSlice,
        tooltip: {
            valueFormatter: formatTooltipValue,
        },
    };

    return (
        <Box flex={1} pb={4}>
            {!data ? (
                renderLoading()
            ) : numberOfTransports === 0 ? (
                renderNoResults()
            ) : (
                <Card flex={1}>
                    {/**
                     * Progress
                     */}
                    <Box p={4} data-testid="transports-dashboard-progress-section">
                        <Box mb={7}>
                            <Text variant="h1">{t("dashboard.transports.progress")}</Text>
                            <Flex pt={3}>
                                <Flex
                                    css={{cursor: "pointer"}}
                                    width={1 / 3}
                                    flexDirection="column"
                                    alignItems="center"
                                    onClick={maybeApplyFilterFromDataKey.bind(
                                        undefined,
                                        "not_done"
                                    )}
                                    data-testid="transports-dashboard-progress-not-done"
                                >
                                    <Flex flex={1} flexDirection="column" justifyContent="center">
                                        <Text
                                            variant="title"
                                            color={
                                                numberOfNotDoneDeliveries
                                                    ? "red.default"
                                                    : "green.default"
                                            }
                                        >
                                            {formatNumber(numberOfNotDoneDeliveries)}
                                        </Text>
                                    </Flex>
                                    <Text
                                        color={
                                            numberOfNotDoneDeliveries
                                                ? "red.default"
                                                : "green.default"
                                        }
                                    >
                                        {t(
                                            "common.transports",
                                            {smart_count: numberOfNotDoneDeliveries},
                                            {capitalize: true}
                                        )}{" "}
                                        {t("dashboard.transports.notDone", {
                                            smart_count: numberOfNotDoneDeliveries,
                                        })}
                                    </Text>
                                </Flex>
                                <Box width={1 / 3} height="200px">
                                    <PieChart {...pieChartsCommonProps} data={progressData} />
                                </Box>
                                <Box width={1 / 3} height="200px">
                                    <PieChart {...pieChartsCommonProps} data={disputesData} />
                                </Box>
                            </Flex>
                        </Box>
                        {/**
                         * Punctuality
                         */}
                        <Box mb={7} data-testid="transports-dashboard-punctuality-section">
                            <Text variant="h1">{t("dashboard.transports.punctuality")}</Text>
                            <Flex pt={3} alignItems="flex-end" justifyContent="flex-end">
                                <Box width={1 / 3}>
                                    <Text textAlign="center">
                                        {t(
                                            "dashboard.transports.punctuality.distributionOfDelays"
                                        )}
                                    </Text>
                                </Box>
                                <Box width={1 / 3}>
                                    <Text textAlign="center">
                                        {t(
                                            "dashboard.transports.punctuality.distributionOfActivityTimes"
                                        )}
                                    </Text>
                                </Box>
                            </Flex>
                            <Flex pt={3}>
                                <Box
                                    width={1 / 3}
                                    height="200px"
                                    pr={4}
                                    data-testid="transports-dashboard-punctuality-bar-chart"
                                >
                                    <BarChart
                                        {...barChartsCommonProps}
                                        // @ts-ignore
                                        data={punctualityData}
                                        // @ts-ignore
                                        bars={punctualityBars}
                                        xAxis={{dataKey: "activityLabel"}}
                                    />
                                </Box>
                                <Box width={1 / 3} height="200px" pr={4}>
                                    <BarChart
                                        {...barChartsCommonProps}
                                        // @ts-ignore
                                        data={distributionOfDelaysData}
                                        // @ts-ignore
                                        bars={distributionOfDelaysBars}
                                        xAxis={{dataKey: "delayLabel"}}
                                    />
                                </Box>
                                <Box width={1 / 3} height="200px" pr={4}>
                                    <BarChart
                                        {...barChartsCommonProps}
                                        // @ts-ignore
                                        data={distributionOfDurationsData}
                                        // @ts-ignore
                                        bars={distributionOfDurationsBars}
                                        xAxis={{dataKey: "durationLabel"}}
                                    />
                                </Box>
                            </Flex>
                        </Box>
                        {/**
                         * Documents
                         */}
                        <Box mb={7} data-testid="transports-dashboard-documents-section">
                            <Text variant="h1">{t("dashboard.transports.documents")}</Text>
                            <Text variant="h1">
                                {t("dashboard.transports.documents.subtitle")}
                            </Text>
                            <Flex pt={3}>
                                <Box width={1 / 2} height="200px">
                                    <PieChart
                                        {...pieChartsCommonProps}
                                        tooltip={{
                                            valueFormatter: (value) =>
                                                formatTooltipValue(value, numberOfDoneDeliveries),
                                        }}
                                        data={cmrDocumentsData}
                                    />
                                </Box>
                                <Box width={1 / 2} height="200px">
                                    <PieChart
                                        {...pieChartsCommonProps}
                                        tooltip={{
                                            valueFormatter: (value) =>
                                                formatTooltipValue(value, numberOfDoneDeliveries),
                                        }}
                                        data={otherDocumentsData}
                                    />
                                </Box>
                            </Flex>
                        </Box>
                    </Box>
                    {numberOfTransports !== numberOfDeliveries && (
                        <Flex backgroundColor="yellow.default" p={4}>
                            <Icon name="warning" color="yellow.dark" mr={4} />
                            <Text flex={1}>
                                {t("dashboard.transports.complexTransportsWarning", {
                                    transport_count: numberOfTransports,
                                    delivery_count: numberOfDeliveries,
                                })}
                            </Text>
                        </Flex>
                    )}
                </Card>
            )}
        </Box>
    );
};
