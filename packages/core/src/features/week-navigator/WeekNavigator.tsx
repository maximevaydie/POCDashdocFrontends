import {Box, Flex, OnDesktop, OnMobile, Text} from "@dashdoc/web-ui";
import React from "react";
import {addDays, isBefore, startOfDay, subDays, tz} from "services/date";
import {TzDate} from "types";

import {ChevronLeftSVG} from "./icons/ChevronLeftSVG";
import {ChevronRightSVG} from "./icons/ChevronRightSVG";

interface WeekNavigatorProps {
    startWeek: TzDate;
    endWeek: TzDate;
    onChange: (startWeek: TzDate) => void;
    allowPast?: boolean;
}

export function WeekNavigator({
    startWeek,
    endWeek,
    onChange,
    allowPast = true,
}: WeekNavigatorProps) {
    const now = tz.now(startWeek.timezone);
    const enablePrevWeekBtn = allowPast || isBefore(startOfDay(now), startOfDay(startWeek));
    return (
        <Flex justifyContent="stretch">
            <Flex
                boxShadow="small"
                border="1px solid"
                borderColor={"blue.ultralight"}
                padding={3}
                borderRadius="23px"
                flexGrow={1}
                justifyContent="space-between"
            >
                {enablePrevWeekBtn ? (
                    <Flex
                        onClick={prevWeek}
                        alignItems="center"
                        style={{cursor: "pointer"}}
                        data-testid="week-navigator-previous"
                    >
                        <ChevronLeftSVG />
                    </Flex>
                ) : (
                    <Flex
                        alignItems="center"
                        style={{visibility: "hidden"}}
                        data-testid="week-navigator-previous"
                    >
                        <ChevronLeftSVG />
                    </Flex>
                )}

                <Box marginX={4} color="purple.dark">
                    <Text variant="h2">
                        <OnDesktop>
                            {tz.format(startWeek, "EEEE dd MMMM")}
                            {" - "}
                            {tz.format(endWeek, "EEEE dd MMMM")}
                        </OnDesktop>
                        <OnMobile>
                            {tz.format(startWeek, "dd MMMM")}
                            {" - "}
                            {tz.format(endWeek, "dd MMMM")}
                        </OnMobile>
                    </Text>
                </Box>
                <Flex onClick={nextWeek} alignItems="center" style={{cursor: "pointer"}}>
                    <ChevronRightSVG />
                </Flex>
            </Flex>
        </Flex>
    );

    function prevWeek() {
        const date = subDays(startWeek, 5);
        onChange(date);
    }

    function nextWeek() {
        const date = addDays(startWeek, 5);
        onChange(date);
    }
}
