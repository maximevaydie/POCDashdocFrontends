import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Text} from "@dashdoc/web-ui";
import React from "react";
import {Control, Controller, useFormContext} from "react-hook-form";

import {TimeRangeInput} from "./TimeRangeInput";

type TimeRange = string[];

type Day = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

interface OpeningHoursEditorProps {
    day: Day;
    control: Control;
    times: TimeRange[];
    onTimesChange: (newTimes: TimeRange[]) => void;
}

export function OpeningHoursEditor({day, times, onTimesChange}: OpeningHoursEditorProps) {
    const {control, setValue, trigger} = useFormContext();

    return (
        <Box>
            <Flex alignItems="center">
                <Text mr={3} textAlign="right" width="60px">
                    {translateDay(day)}
                </Text>
                <Box flexGrow={1}>
                    {times &&
                        times.map((range, index) => (
                            <Controller
                                name={`opening_hours.${day}[${index}]`}
                                key={`${day}-${index}`}
                                control={control}
                                defaultValue={range}
                                render={({field}) => (
                                    <TimeRangeInput
                                        isFirst={index === 0}
                                        {...field}
                                        onDelete={() => handleDeleteTimeRange(index)}
                                    />
                                )}
                            />
                        ))}
                </Box>
                <Flex alignItems="center" onClick={handleAddTimeRange} ml={2}>
                    <Icon name="add" mr={1} color="inherit" />
                </Flex>
            </Flex>
        </Box>
    );

    function handleAddTimeRange() {
        const updatedTimeRanges = [...times, ["", ""]];
        setValue(`opening_hours.${day}`, updatedTimeRanges);
        trigger(`opening_hours.${day}`);
    }

    function handleDeleteTimeRange(index: number) {
        const updatedTimeRanges = [...times];
        updatedTimeRanges.splice(index, 1);
        onTimesChange(updatedTimeRanges);
    }

    function translateDay(day: Day): string {
        const labels: Record<string, string> = {
            monday: t("common.monday"),
            tuesday: t("common.tuesday"),
            wednesday: t("common.wednesday"),
            thursday: t("common.thursday"),
            friday: t("common.friday"),
            saturday: t("common.saturday"),
            sunday: t("common.sunday"),
        };
        return labels[day] || day;
    }
}
