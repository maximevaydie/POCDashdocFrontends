import {Box, Flex, Text, useDevice, useResourceOffset} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate} from "dashdoc-utils";
import {startOfDay, isSameDay, eachDayOfInterval, eachMinuteOfInterval, isEqual} from "date-fns";
import capitalize from "lodash.capitalize";
import React, {ReactNode, useMemo} from "react";

import {
    TRUCKER_CELL_WIDTH,
    TIME_CELL_WIDTH,
    REVENUE_CELL_WIDTH,
    COLLAPSED_TIME_WIDTH,
} from "../gridStyles";

type SchedulerHeaderProps = {
    resourcesHeader: ReactNode;
    additionalResourcesInformationHeader: ReactNode;
    dateSections: Array<{start: Date; end: Date}>;
    minuteScale: number; // scale in minutesPerDay
    getDayIndicator?: (day: Date, currentDate: Date) => ReactNode | null;
    timezone: string;
};
export const TimeHeader = React.memo(function TimeHeader({
    resourcesHeader,
    additionalResourcesInformationHeader,
    dateSections,
    minuteScale,
    getDayIndicator,
    timezone,
}: SchedulerHeaderProps) {
    const device = useDevice();

    return (
        <Flex position="sticky" top={0} left={0} zIndex="level1" backgroundColor="grey.ultralight">
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
                zIndex="level1"
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
                px={2}
                backgroundColor={"grey.ultralight"}
                zIndex={device === "mobile" ? "level0" : "level1"}
            >
                {additionalResourcesInformationHeader}
            </Flex>

            {dateSections.map((dateSection, index) => (
                <Flex key={index}>
                    <Dates
                        startDate={dateSection.start}
                        endDate={dateSection.end}
                        minuteScale={minuteScale}
                        getDayIndicator={getDayIndicator}
                        timezone={timezone}
                    />
                    {index !== dateSections.length - 1 && <CollapsedDates />}
                </Flex>
            ))}
        </Flex>
    );
});

function Dates({
    startDate,
    endDate,
    minuteScale,
    getDayIndicator,
    timezone,
}: {
    startDate: Date;
    endDate: Date;
    minuteScale: number; // scale in minutesPerCell
    getDayIndicator?: (day: Date, currentDate: Date) => ReactNode | null;
    timezone: string;
}) {
    const currentDate: Date = parseAndZoneDate(new Date(), timezone) as Date;

    const days = useMemo(() => {
        return eachDayOfInterval({start: startDate, end: endDate});
    }, [startDate, endDate]);

    const dates = useMemo(() => {
        return eachMinuteOfInterval({start: startDate, end: endDate}, {step: minuteScale * 2});
    }, [startDate, endDate, minuteScale]);

    const dateWidth = 2 * TIME_CELL_WIDTH;

    const cellsPerDay = dates.length / days.length;
    const dayWidth = cellsPerDay * dateWidth;

    const resourceOffset = useResourceOffset();
    return (
        <>
            {/* Dates */}
            <Box display="flex" flexDirection="column">
                <Flex my={1} flex={1}>
                    {days.map((day) => (
                        <Flex
                            key={`${formatDate(day, "MM-dd")}-header-cell`}
                            width={dayWidth}
                            position="sticky"
                            left={resourceOffset}
                            backgroundColor="grey.ultralight"
                            alignItems={"center"}
                        >
                            <Text
                                variant="captionBold"
                                color={isSameDay(day, currentDate) ? "blue.default" : "grey.dark"}
                            >
                                {capitalize(formatDate(day, "EEEE"))} {formatDate(day, "P-")}
                            </Text>
                            <Box ml={2} my={-1}>
                                {getDayIndicator?.(day, currentDate)}
                            </Box>
                        </Flex>
                    ))}
                </Flex>
                <Flex>
                    {dates.map((date, index) => (
                        <Box
                            key={`${formatDate(date, "Pp")}-header-cell`}
                            width={dateWidth}
                            borderRight={isNextDateANewDay(index) ? "2px solid" : "1px solid"}
                            borderColor="grey.default"
                            pl={1}
                            position="relative"
                        >
                            <Text variant="subcaption" color="grey.default" mb={1}>
                                {formatDate(date, "p")}
                            </Text>
                            <Box
                                position="absolute"
                                left={0}
                                bottom={0}
                                width={dateWidth / 2}
                                height={"10px"}
                                borderRight="1px dashed"
                                borderColor="grey.default"
                            />
                            <Box ml={-1} borderBottom="1px solid" borderColor="grey.light" />
                        </Box>
                    ))}
                </Flex>
            </Box>
        </>
    );

    function isNextDateANewDay(index: number) {
        return index + 1 < dates.length && isEqual(startOfDay(dates[index + 1]), dates[index + 1]);
    }
}

function CollapsedDates() {
    return (
        <Flex
            marginLeft={"-1px"}
            width={`${COLLAPSED_TIME_WIDTH + 1}px`}
            height="100%"
            borderBottom="1px solid"
            borderColor="grey.light"
            alignItems="flex-end"
        >
            <Box
                height="20px"
                width="100%"
                borderLeft={"2px solid"}
                borderRight={"2px solid"}
                borderColor={"grey.default"}
            ></Box>
        </Flex>
    );
}
