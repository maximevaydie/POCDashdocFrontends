import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {formatDate, formatNumber} from "dashdoc-utils";
import React, {useMemo} from "react";
import {useSelector} from "react-redux";

import {getTotalTurnover} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.service";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {getPlannedTripsForCurrentQuery} from "app/redux/selectors";

export function RevenueHeader({
    view,
    startDate,
    endDate,
}: {
    view: TripSchedulerView;
    startDate: Date;
    endDate: Date;
}) {
    const startDateFormatted = formatDate(startDate, "P-");
    const endDateFormatted = formatDate(endDate, "P-");
    const timezone = useTimezone();

    const trips = useSelector(getPlannedTripsForCurrentQuery);
    const totalRevenue = useMemo(() => {
        const turnover = getTotalTurnover(trips, view, startDate, endDate, timezone);

        return (
            <Flex flexDirection={"column"} alignItems={"center"} maxWidth={"200px"}>
                <Text>
                    {t("common.total") +
                        " : " +
                        (turnover
                            ? formatNumber(turnover, {
                                  style: "currency",
                                  currency: "EUR",
                                  maximumFractionDigits: 0,
                                  minimumFractionDigits: 0,
                              })
                            : "--")}
                </Text>
                <Text mt={2} textAlign={"center"}>
                    {t("scheduler.totalRevenuePurchaseCostTooltip")}
                </Text>
            </Flex>
        );
    }, [endDate, startDate, view, timezone, trips]);
    return (
        <TooltipWrapper content={totalRevenue} placement="top">
            <Box py={2}>
                {/*
// @ts-ignore */}
                <Text variant="captionBold" color={null} textAlign="center">
                    {t("scheduler.totalRevenue")}
                </Text>
                {startDateFormatted !== endDateFormatted && (
                    <Text fontSize="8px" lineHeight="12px" color="grey.dark" textAlign="center">
                        {startDateFormatted}
                        {" - "}
                        {endDateFormatted}
                    </Text>
                )}
            </Box>
        </TooltipWrapper>
    );
}
