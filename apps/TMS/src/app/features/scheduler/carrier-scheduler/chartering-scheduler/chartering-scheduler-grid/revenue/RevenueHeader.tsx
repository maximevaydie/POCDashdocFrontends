import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {formatDate, formatNumber} from "dashdoc-utils";
import React, {useMemo} from "react";

import {DedicatedResourcesView} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";

import {CharteringView, RawCarrierCharteringSchedulerSegment} from "../chartering-scheduler.types";

import {getTotalTurnover} from "./revenue.service";

export function RevenueHeader({
    charteringSegments,
    startDate,
    endDate,
    viewType,
}: {
    charteringSegments: RawCarrierCharteringSchedulerSegment[];
    startDate: Date;
    endDate: Date;
    viewType: CharteringView | DedicatedResourcesView;
}) {
    const startDateFormatted = formatDate(startDate, "P-");
    const endDateFormatted = formatDate(endDate, "P-");
    const timezone = useTimezone();

    const totalRevenue = useMemo(() => {
        const turnover = getTotalTurnover(
            charteringSegments,
            startDate,
            endDate,
            timezone,
            viewType
        );

        return (
            t("common.total") +
            " : " +
            (turnover
                ? formatNumber(turnover, {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                  })
                : "--")
        );
    }, [endDate, startDate, charteringSegments, timezone, viewType]);
    return (
        <TooltipWrapper content={totalRevenue} placement="top">
            <Box py={2}>
                {/*
// @ts-ignore */}
                <Text variant="captionBold" color={null} textAlign="center">
                    {t("scheduler.totalCost")}
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
