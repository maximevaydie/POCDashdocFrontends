import {t} from "@dashdoc/web-core";
import {Box, DatePicker, Flex, IconNames, Text, TimePicker} from "@dashdoc/web-ui";
import React from "react";

export type DateTimePickerProps = {
    date: Date | null;
    blurOnArrowUpDown?: boolean;
    hoursType?: "unique" | "between";
    autoFocus?: boolean;
    clearable?: boolean;
    timeMin?: string;
    timeMax?: string;
    minAllowedTime?: string;
    maxAllowedTime?: string;
    minPickableDate?: any;
    fallbackInvalidDate?: boolean;
    required?: boolean;
    maxPickableDate?: any;
    onDateChange: (date: Date) => void;
    onTimeChange: ({min, max}: {min?: string; max?: string}) => void;
    hasTimeError?: boolean;
    hasDateError?: boolean;
    disabled?: boolean;
    rootId?: string;
    specialDate?: Date;
    specialDateIcon?: IconNames;
    specialTimeMin?: string;
    specialTimeMax?: string;
    specialTimeIcon?: IconNames;
};

export function DateTimePicker({
    date,
    blurOnArrowUpDown = false,
    hoursType = "between",
    autoFocus = false,
    clearable = false,
    timeMax,
    timeMin,
    fallbackInvalidDate = true,
    required = false,
    minAllowedTime,
    maxAllowedTime,
    minPickableDate,
    maxPickableDate,
    onDateChange,
    onTimeChange,
    hasTimeError,
    hasDateError,
    disabled,
    rootId = "react-app",
    specialDate,
    specialDateIcon,
    specialTimeMin,
    specialTimeMax,
    specialTimeIcon,
}: DateTimePickerProps) {
    const handleArrivalTimeMinChange = (arrival_time_min: any) => {
        // Comparing strings directly works here, because of the hour format
        // @ts-ignore
        if ((!timeMax && arrival_time_min) || timeMax < arrival_time_min?.value) {
            onTimeChange({min: arrival_time_min.value, max: arrival_time_min.value});
            return;
        }
        // arrival_time_min can be null
        const newTime = arrival_time_min ? arrival_time_min.value : arrival_time_min;
        // update end time if equals 23:59 as it is consider as the default value
        if (newTime && timeMax === "23:59") {
            onTimeChange({
                min: newTime,
                max: newTime,
            });
        } else {
            onTimeChange({
                min: newTime,
            });
        }
    };

    const handleArrivalTimeMaxChange = (arrival_time_max: any) => {
        // Comparing strings directly works here, because of the hour format
        // @ts-ignore
        if ((!timeMin && arrival_time_max) || timeMin > arrival_time_max?.value) {
            onTimeChange({min: arrival_time_max.value, max: arrival_time_max.value});
            return;
        }
        // arrival_time_max can be null
        onTimeChange({
            max: arrival_time_max ? arrival_time_max.value : arrival_time_max,
        });
    };

    return (
        <>
            <Flex alignItems="center">
                {/*
// @ts-ignore */}
                <Text mr={2}>{t("common.dateOn", null, {capitalize: true})}</Text>
                <Box flex={1}>
                    <DatePicker
                        clearable={clearable}
                        date={date}
                        autoFocus={autoFocus}
                        fallbackInvalidDate={fallbackInvalidDate}
                        required={required}
                        placeholder={
                            disabled ? t("trip.noDateProvided") : t("common.clickSelectDate")
                        }
                        onChange={onDateChange}
                        minDate={minPickableDate}
                        maxDate={maxPickableDate}
                        data-testid="date-picker"
                        blurOnArrowUpDown={blurOnArrowUpDown}
                        rootId={rootId}
                        error={hasDateError}
                        disabled={disabled}
                        specialDate={specialDate}
                        specialDateIcon={specialDateIcon}
                    />
                </Box>
            </Flex>
            <Flex alignItems="center" mt={2}>
                <Text mr={2}>
                    {/*
// @ts-ignore */}
                    {t(hoursType === "between" ? "common.timeBetween" : "common.at", null, {
                        capitalize: true,
                    })}
                </Text>
                <Box flex={1}>
                    <TimePicker
                        onChange={handleArrivalTimeMinChange}
                        // @ts-ignore
                        value={timeMin ? {value: timeMin, label: timeMin} : null}
                        minTime={minAllowedTime}
                        maxTime={maxAllowedTime}
                        data-testid="min-time-picker"
                        date={date}
                        hasErrors={hasTimeError}
                        disabled={disabled}
                        specialTime={specialTimeMin}
                        specialTimeIcon={specialTimeIcon}
                    />
                </Box>
                {hoursType === "between" && (
                    <>
                        <Text mx={2}>{t("common.timeAnd")}</Text>
                        <Box flex={1}>
                            <TimePicker
                                onChange={handleArrivalTimeMaxChange}
                                // @ts-ignore
                                value={timeMax ? {value: timeMax, label: timeMax} : null}
                                minTime={minAllowedTime}
                                maxTime={maxAllowedTime}
                                data-testid="max-time-picker"
                                date={date}
                                hasErrors={hasTimeError}
                                disabled={disabled}
                                specialTime={specialTimeMax}
                                specialTimeIcon={specialTimeIcon}
                            />
                        </Box>
                    </>
                )}
            </Flex>
        </>
    );
}
