import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import {TodayDecorator} from "features/today-decorator/TodayDecorator";
import React from "react";
import {isSameDay, tz} from "services/date";
import {TzDate} from "types";

type Props = {startTime: TzDate; endTime: TzDate};

export function DateAndTime({startTime, endTime}: Props) {
    return (
        <Box>
            <Flex data-testid="slot-panel-date">
                <Text mr={2} variant="h1">
                    {tz.format(startTime, "EEEE dd MMMM")}
                </Text>
                <TodayDecorator startTime={startTime} />
            </Flex>
            <Flex data-testid="slot-panel-time" alignItems="baseline">
                <Text variant="title">{tz.format(startTime, "HH:mm")}</Text>
                <Text variant="h1" ml={2}>
                    {t("common.timeTo")}
                </Text>
                {!isSameDay(startTime, endTime) && (
                    <Text
                        ml={2}
                        variant="h1"
                        textOverflow="ellipsis"
                        overflow="hidden"
                        whiteSpace="nowrap"
                    >
                        {tz.format(endTime, "EEEE dd MMMM")}
                    </Text>
                )}
                <Text ml={2} variant="title">
                    {tz.format(endTime, "HH:mm")}
                </Text>
            </Flex>
        </Box>
    );
}
