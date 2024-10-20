import {Box, Flex, Icon, IconNames} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import {endOfDay, startOfDay} from "date-fns";
import isEmpty from "lodash.isempty";
import React, {FunctionComponent, useCallback, useMemo, useState} from "react";

import {CreatableSelect} from "../../choice/select2/Select";
import {SelectProps} from "../../choice/select2/types";

export type TimePickerProps = Partial<SelectProps> & {
    minTime?: string;
    maxTime?: string;
    hasErrors?: boolean;
    date?: Date | null;
    timeStep?: number;
    disabled?: boolean;
    value?: {label: string; value: string};
    "data-testid"?: string;
    specialTime?: string;
    specialTimeIcon?: IconNames;
};

export const TimePicker: FunctionComponent<TimePickerProps> = (props: TimePickerProps) => {
    const {
        minTime,
        maxTime,
        hasErrors,
        date,
        timeStep = 15,
        disabled,
        value,
        specialTime,
        specialTimeIcon,
        ...selectProps
    } = props;

    const [inputValue, setInputValue] = useState("");

    const options = useMemo(() => {
        const d = date ? date : new Date();
        let startDate = startOfDay(d);
        const endDate = endOfDay(d);
        const options = [];
        if (specialTime) {
            options.push({
                value: specialTime,
                label: specialTime,
                special: true,
            });
        }
        if (minTime) {
            const minTimes = minTime.split(":");
            startDate.setHours(parseInt(minTimes[0]));
            const firstMinutes = parseInt(minTimes[1]);
            let minutes = firstMinutes;
            if (60 % timeStep === 0) {
                minutes = Math.ceil(minutes / timeStep) * timeStep;
            }
            if (minutes !== firstMinutes) {
                // We add an option with the first minutes value
                const firstTime = startOfDay(d);
                firstTime.setHours(parseInt(minTimes[0]));
                firstTime.setMinutes(firstMinutes);
                const timeLabel = formatDate(firstTime, "HH:mm");
                options.push({value: timeLabel, label: timeLabel});
            } // else, let's the while loop handle it
            startDate.setMinutes(minutes);
        }
        if (maxTime) {
            const maxTimes = maxTime.split(":");
            endDate.setHours(parseInt(maxTimes[0]));
            endDate.setMinutes(parseInt(maxTimes[1]));
        }
        while (startDate <= endDate) {
            const timeOption = formatDate(startDate, "HH:mm");
            options.push({value: timeOption, label: timeOption});
            startDate = new Date(startDate.getTime() + timeStep * 60 * 1000);
        }
        if (!isEmpty(props.inputValue)) {
            // @ts-ignore
            return options.filter((option) => option.label.startsWith(props.inputValue));
        }
        return options;
    }, [date, minTime, maxTime, props.inputValue, timeStep, specialTime]);

    // need to use options[index] to have the select menu scroll automatically to the selected value
    const selectedValueWithIndex = useMemo(() => {
        return options.find((option) => option.value === value?.value) ?? value;
    }, [options, value]);

    const filterOptions = useCallback(
        (
            option: {
                value: string;
                label: string;
            },
            text: string
        ) => {
            return option.value.startsWith(text);
        },
        []
    );

    const formatTimeValue = useCallback(
        (value: string) => {
            let newValue = value;
            if (newValue.length > 5) {
                return;
            }
            if (newValue) {
                if (newValue.length === 1 && /[3-9]$/.test(newValue)) {
                    newValue = "0" + newValue;
                }
                if (newValue.length === 2) {
                    if (!inputValue || inputValue.length < newValue.length) {
                        newValue = newValue + ":";
                    } else {
                        newValue = newValue.slice(0, -1);
                    }
                }
                newValue = newValue.replace("::", ":");
            }
            setInputValue(newValue);
        },
        [inputValue]
    );
    const formatCreateLabel = useCallback((value: string) => value, []);
    const isTimeValid = useCallback(
        (value: string) => {
            return (
                options.findIndex((option) => option.value === value) === -1 &&
                /([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)
            );
        },
        [options]
    );

    const formatOptionLabel = (option: any, {context}: any) => {
        return option.special ? (
            <>
                <Flex>
                    {context === "menu" ? (
                        <Box
                            backgroundColor="blue.ultralight"
                            borderRadius={1}
                            color="blue.default"
                            px={2}
                            py={1}
                        >
                            {option.label}
                        </Box>
                    ) : (
                        option.label
                    )}
                    {specialTimeIcon && <Icon name={specialTimeIcon} ml={2} mb={1} />}
                </Flex>
                {context === "menu" && (
                    <Box
                        borderBottom={"1px solid"}
                        borderColor="grey.light"
                        marginTop={3}
                        mx={-3}
                        mb={-2}
                    />
                )}
            </>
        ) : (
            option.label
        );
    };

    return (
        <CreatableSelect
            data-testid={props["data-testid"]}
            placeholder="--:--"
            options={options}
            error={hasErrors}
            isDisabled={disabled}
            filterOption={filterOptions}
            value={selectedValueWithIndex}
            formatCreateLabel={formatCreateLabel}
            inputValue={inputValue}
            onInputChange={formatTimeValue}
            isValidNewOption={isTimeValid}
            formatOptionLabel={formatOptionLabel}
            {...selectProps}
        />
    );
};
