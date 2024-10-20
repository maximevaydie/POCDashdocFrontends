import {Box, Flex, Text, useDevice} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate} from "dashdoc-utils";
import {isSameDay} from "date-fns";
import capitalize from "lodash.capitalize";
import React, {ReactNode} from "react";

import {
    CarrierSchedulerHeaderCell,
    COLLAPSED_TIME_WIDTH,
    REVENUE_CELL_WIDTH,
    TRUCKER_CELL_WIDTH,
} from "../gridStyles";

import {SideSwipeType} from "./schedulerByDay.types";

type SchedulerHeaderProps = {
    resourcesHeader: ReactNode;
    additionalResourcesInformationHeader: ReactNode;
    daysSections: Date[][];
    animation: SideSwipeType;
    getDayIndicator?: (day: Date, currentDate: Date) => ReactNode | null;
    timezone: string;
};
export function DayHeader({
    resourcesHeader,
    additionalResourcesInformationHeader,
    daysSections,
    animation,
    getDayIndicator,
    timezone,
}: SchedulerHeaderProps) {
    const device = useDevice();

    return (
        <Flex position="sticky" left={0} top={0} zIndex="level1" backgroundColor="grey.ultralight">
            {/* Resource header */}
            <Flex
                position="sticky"
                left={0}
                width={TRUCKER_CELL_WIDTH}
                borderRight="1px solid"
                borderBottom="1px solid"
                borderColor="grey.light"
                px={2}
                backgroundColor={"grey.ultralight"}
                zIndex="level2"
            >
                {resourcesHeader}
            </Flex>

            {/* Additional resource information header */}
            <Flex
                position={device === "mobile" ? "unset" : "sticky"}
                left={TRUCKER_CELL_WIDTH}
                width={REVENUE_CELL_WIDTH}
                borderRight="1px solid"
                borderBottom="1px solid"
                borderColor="grey.light"
                backgroundColor={"grey.ultralight"}
                zIndex={device === "mobile" ? "level0" : "level2"}
            >
                {additionalResourcesInformationHeader}
            </Flex>

            {/* Days */}
            {daysSections.map((daySection, index) => (
                <React.Fragment key={index}>
                    <Dates
                        days={daySection}
                        animation={animation}
                        getDayIndicator={getDayIndicator}
                        timezone={timezone}
                    />
                    {index !== daysSections.length - 1 && <CollapsedDates />}
                </React.Fragment>
            ))}
            {}
        </Flex>
    );
}

function Dates({
    days,
    animation,
    getDayIndicator,
    timezone,
}: {
    days: Date[];
    animation: SideSwipeType;
    getDayIndicator?: (day: Date, currentDate: Date) => ReactNode | null;
    timezone: string;
}) {
    const currentDate: Date = parseAndZoneDate(new Date(), timezone) as Date;
    return (
        <>
            {days.map((day) => (
                <CarrierSchedulerHeaderCell
                    animation={animation}
                    key={`${formatDate(day, "MM-dd")}-header-cell`}
                >
                    <Text
                        variant="captionBold"
                        color={isSameDay(day, currentDate) ? "blue.default" : "grey.dark"}
                        flex={1}
                    >
                        {capitalize(formatDate(day, "EEEE"))} {formatDate(day, "P-")}
                    </Text>
                    {getDayIndicator?.(day, currentDate)}
                </CarrierSchedulerHeaderCell>
            ))}
        </>
    );
}

function CollapsedDates() {
    return (
        <Flex
            width={`${COLLAPSED_TIME_WIDTH + 1}px`}
            height="100%"
            borderBottom="1px solid"
            borderColor="grey.light"
            alignItems="flex-end"
            ml={"-1px"}
            zIndex="level1"
        >
            <Box
                height="100%"
                width="100%"
                borderLeft={"2px solid"}
                borderRight={"2px solid"}
                borderColor={"grey.default"}
            ></Box>
        </Flex>
    );
}
