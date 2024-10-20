import {FiltersPeriod, PeriodFilterQueryKeys} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Flex,
    IconButton,
    DateRangePickerRange,
    Text,
    TooltipWrapper,
    useDevice,
} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import add from "date-fns/add";
import differenceInDays from "date-fns/differenceInDays";
import sub from "date-fns/sub";
import React, {useContext} from "react";

import {SchedulerFilters} from "app/features/scheduler/carrier-scheduler/components/filters/filters.types";
import {useSchedulerPeriodStaticRanges} from "app/features/scheduler/carrier-scheduler/components/filters/useSchedulerPeriodStaticRanges";
import {PoolCurrentQueryContext} from "app/screens/trip/TripEditionScreen";

type SchedulerDateRangeSelectProps = {
    startDate: Date;
    endDate: Date;
    onDateRangeChange: (dateRange: DateRangePickerRange) => void;
};

const basicPeriodQueryKeys: PeriodFilterQueryKeys<SchedulerFilters> = {
    start_date_key: "start_date",
    end_date_key: "end_date",
    period_key: "period",
};

export function SchedulerDateRangeSelect({
    startDate,
    endDate,
    onDateRangeChange,
}: SchedulerDateRangeSelectProps) {
    const {currentQuery, updateSchedulerDates} = useContext(PoolCurrentQueryContext);

    const schedulerPeriodStaticRanges = useSchedulerPeriodStaticRanges();
    const isMobileDevice = useDevice() === "mobile";

    return (
        <Flex alignItems="center">
            <TooltipWrapper content={t("scheduler.previousPeriod")}>
                <IconButton name="arrowLeft" onClick={goToPreviousPeriod} flexShrink={0} />
            </TooltipWrapper>
            <FiltersPeriod<SchedulerFilters>
                currentQuery={currentQuery}
                updateQuery={updateSchedulerDates}
                queryKeys={basicPeriodQueryKeys}
                periodFilterProps={{
                    leftIcon: null,
                    label: (
                        <Flex
                            alignItems={"baseline"}
                            minWidth={isMobileDevice ? "0px" : "170px"}
                            maxWidth={isMobileDevice ? "60px" : undefined}
                            flexWrap={"wrap"}
                        >
                            {!isMobileDevice && <Text mr={1}>{getPeriodLabel()}</Text>}
                            <Text
                                color="grey.dark"
                                variant={isMobileDevice ? "subcaption" : "caption"}
                            >
                                {getDatesLabel()}
                            </Text>
                        </Flex>
                    ),
                    staticRanges: schedulerPeriodStaticRanges,
                    isDeletable: false,
                }}
                testId="period"
            />
            <TooltipWrapper content={t("scheduler.nextPeriod")}>
                <IconButton name="arrowRight" onClick={goToNextPeriod} flexShrink={0} />
            </TooltipWrapper>
        </Flex>
    );

    function getPeriodLabel() {
        if (currentQuery.period) {
            const periodBadgeData = schedulerPeriodStaticRanges?.[currentQuery.period];
            if (periodBadgeData) {
                return `${periodBadgeData.label ? t(periodBadgeData.label) : ""}`;
            }
        }
        return "";
    }

    function getDatesLabel() {
        return formatDate(startDate, "P") === formatDate(endDate, "P")
            ? `${formatDate(startDate, "P")}`
            : `${formatDate(startDate, "P")} - ${formatDate(endDate, "P")}`;
    }

    function goToPreviousPeriod() {
        const numberOfDays = differenceInDays(endDate, startDate);
        onDateRangeChange({
            startDate: sub(startDate, {days: numberOfDays + 1}),
            endDate: sub(endDate, {days: numberOfDays + 1}),
        });
    }
    function goToNextPeriod() {
        const numberOfDays = differenceInDays(endDate, startDate);
        onDateRangeChange({
            startDate: add(startDate, {days: numberOfDays + 1}),
            endDate: add(endDate, {days: numberOfDays + 1}),
        });
    }
}
