import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    DropdownContent,
    Flex,
    Icon,
    IconNames,
    BoxProps,
    DropdownProps,
    TextInput,
    theme,
} from "@dashdoc/web-ui";
import {formatDate, getLocaleData, isValidDate, useToggle} from "dashdoc-utils";
import {isSameDay, parse, startOfDay} from "date-fns";
import addDays from "date-fns/addDays";
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from "react";
import {Calendar} from "react-date-range";

import {ClickOutside} from "../../layout/ClickOutside";

import {CalendarStyles} from "./DateRangePicker";
import {TimePicker} from "./TimePicker";

const startOfToday: Date = startOfDay(new Date());
const tomorrow = addDays(startOfToday, 1);

export type DatePickerProps = {
    "data-testid"?: string;
    autoFocus?: boolean;
    blurOnArrowUpDown?: boolean;
    clearable?: boolean;
    date: Date | null;
    dateDisplayFormat?: string;
    disabled?: boolean;
    dropdownAlignRight?: boolean;
    error?: string | boolean;
    fallbackInvalidDate?: boolean;
    label?: string;
    leftIcon?: DropdownProps["leftIcon"];
    maxDate?: Date;
    minDate?: Date;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    required?: boolean;
    rootId?: string;
    showTime?: boolean;
    timeLabel?: string;
    timeWidth?: number;
    textInputHeight?: string | number;
    textInputWidth?: string;
    value?: string;
    specialDate?: Date;
    specialDateIcon?: IconNames;
    shortcutDates?: Array<{
        key: string;
        value: Date;
        label: string;
        isSmartSuggest?: boolean;
        ["data-testid"]?: string;
    }>;
    inputProps?: Pick<BoxProps, "textAlign">;
    calendarSelectionOnly?: boolean;
};

const getTime = (date: Date | null) => {
    if (!date) {
        return null;
    }
    return formatDate(date, "HH:mm");
};

/**
 * Our own DatePicker component.
 *
 * The value is a `Date` object representing the given
 * date and time in the user's browser timezone.
 *
 * Note that the browser timezone is not necessarily the company timezone,
 * so you'll have to take that into account and use our provided tools
 * to handle timezones correctly.
 *
 */
export const DatePicker: FunctionComponent<DatePickerProps> = (props) => {
    const localeData = getLocaleData();

    const {
        "data-testid": dataTestId,
        autoFocus,
        blurOnArrowUpDown = false,
        clearable,
        date,
        dateDisplayFormat = "P",
        disabled,
        dropdownAlignRight,
        error,
        fallbackInvalidDate = true,
        label,
        leftIcon,
        maxDate,
        // Default minDate to prevent user manually entering a date with two digits (see BUG-3597)
        minDate = new Date("1000-01-01"),
        onChange,
        placeholder,
        required = false,
        rootId = "react-app",
        showTime = false,
        timeLabel,
        timeWidth = 110,
        textInputHeight,
        textInputWidth,
        value,
        specialDate,
        specialDateIcon,
        shortcutDates = [
            {
                key: "today",
                label: t("common.today"),
                value: startOfToday,
                ["data-testid"]: "date-picker-today",
            },
            {
                key: "tomorrow",
                label: t("dateRangePicker.staticRanges.tomorrow"),
                value: tomorrow,
                ["data-testid"]: "date-picker-tomorrow",
            },
        ],
        calendarSelectionOnly,
        inputProps,
    } = props;

    const textInputWidthComputed = useMemo(() => {
        if (textInputWidth) {
            return textInputWidth;
        }
        return showTime ? `calc(100% - ${timeWidth}px)` : "100%";
    }, [textInputWidth, showTime, timeWidth]);

    const getDateAsString = useCallback(
        (d: Date | null): string => {
            return d ? formatDate(d, dateDisplayFormat) : "";
        },
        [dateDisplayFormat]
    );
    const dateSeparator = getDateAsString(new Date()).replace(/[0-9]*/, "")?.[0] || "";

    const [dateText, setDateText] = useState<string>(getDateAsString(date));
    const [time, setTime] = useState<string | null>(getTime(date));
    useEffect(() => {
        setTime(getTime(date));
        setDateText(getDateAsString(date));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date]);

    // Manage dropdown opening
    const [isOpen, open, close] = useToggle();

    useEffect(() => {
        close();
    }, [close]);

    const handleChange = useCallback(
        (d: Date | null, time: string | null, closeOnChange = true) => {
            if (d === null) {
                onChange(null);
                return;
            } else if (isValidDate(d)) {
                const date = new Date(d.getTime());
                if (showTime && time && isValidDate(date)) {
                    const times = time.split(":");
                    date.setHours(parseInt(times[0]));
                    date.setMinutes(parseInt(times[1]));
                }
                if (
                    isValidDate(date) &&
                    (!minDate || minDate <= date) &&
                    (!maxDate || maxDate >= date)
                ) {
                    onChange(date);
                } else if (clearable) {
                    onChange(null);
                } else if (fallbackInvalidDate) {
                    onChange(minDate ?? startOfToday);
                } else if (isValidDate(date)) {
                    onChange(date);
                }
            }
            closeOnChange && close();
        },
        [minDate, maxDate, clearable, fallbackInvalidDate, close, showTime, onChange]
    );

    const formatDateText = useCallback(
        (value: string) => {
            let newValue = value;
            if (newValue.length > 10) {
                return;
            }
            if (newValue) {
                if (newValue.length == 2 || newValue.length == 5) {
                    if (!dateText || dateText.length < newValue.length) {
                        newValue = newValue + dateSeparator;
                    } else {
                        newValue = newValue.slice(0, -1);
                    }
                }
                newValue = newValue.replace(dateSeparator + dateSeparator, dateSeparator);
            }
            setDateText(newValue);
        },
        [dateText]
    );

    const handleTextChange = useCallback(() => {
        if (dateText === "") {
            if (clearable) {
                return handleChange(null, time, false);
            }

            return;
        }

        const d = parse(dateText, dateDisplayFormat, new Date(), {locale: localeData});
        // trigger onChange only if date has been modified (do not compare with hours)
        if (
            !date ||
            d.getDate() !== date.getDate() ||
            d.getMonth() !== date.getMonth() ||
            d.getFullYear() !== date.getFullYear()
        ) {
            handleChange(d, time, false);
        }
    }, [dateText, clearable, dateDisplayFormat, localeData, date, handleChange, time]);

    const handleTimeChange = useCallback(
        (timeValue: any) => {
            setTime(timeValue.value);
            const d = date ? date : startOfToday;
            handleChange(d, timeValue.value);
        },
        [date, handleChange]
    );

    const handleKeypressDown = useCallback(
        (event: KeyboardEvent) => {
            if (isOpen) {
                if (event.key === "Escape") {
                    event.stopPropagation();
                    close();
                }
            }
        },
        [close, isOpen]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeypressDown, true);
        return () => {
            document.removeEventListener("keydown", handleKeypressDown, true);
        };
    }, [handleKeypressDown]);

    const dateTextParsed = parse(dateText, dateDisplayFormat, new Date(), {locale: localeData});

    const showErrorOnInput =
        !disabled &&
        (error ||
            (required &&
                ((dateText === "" && !clearable) ||
                    (!fallbackInvalidDate && !isValidDate(dateTextParsed)))));

    const specialDateSelected =
        specialDate && (value ?? dateText) === getDateAsString(specialDate);

    const calendarContent = (
        <>
            {(specialDate || shortcutDates.length > 0) && (
                <Box p={4} pb={0}>
                    {specialDate && (
                        <>
                            <Button
                                variant="plain"
                                width={1}
                                justifyContent="flex-start"
                                onClick={handleChange.bind(undefined, specialDate, time)}
                            >
                                <Box
                                    backgroundColor="blue.ultralight"
                                    px={2}
                                    py={1}
                                    borderRadius={1}
                                    ml={-2}
                                >
                                    {formatDate(specialDate, dateDisplayFormat)}
                                </Box>
                                {specialDateIcon && <Icon name={specialDateIcon} ml={2} mb={1} />}
                            </Button>
                            <Box
                                borderBottom={"1px solid"}
                                borderColor="grey.light"
                                my={1}
                                mx={2}
                            />
                        </>
                    )}
                    {shortcutDates.map((shortcut) => (
                        <Button
                            key={shortcut.key}
                            variant="plain"
                            width={1}
                            justifyContent="flex-start"
                            disabled={
                                (maxDate && shortcut.value > maxDate) ||
                                (minDate && shortcut.value < minDate)
                            }
                            onClick={handleChange.bind(undefined, shortcut.value, time)}
                            data-testid={shortcut["data-testid"]}
                        >
                            {shortcut.label}
                        </Button>
                    ))}
                </Box>
            )}
            <CalendarStyles>
                <Calendar
                    date={date === null ? undefined : date}
                    onChange={(d: Date) => {
                        if (isValidDate(d)) {
                            handleChange(d, time);
                        }
                    }}
                    dateDisplayFormat={dateDisplayFormat}
                    minDate={minDate || undefined}
                    maxDate={maxDate || undefined}
                    locale={localeData}
                    color={theme.colors.blue.default}
                />
            </CalendarStyles>
        </>
    );

    return calendarSelectionOnly ? (
        calendarContent
    ) : (
        <Flex alignItems="top" flexWrap="wrap" flex={1}>
            <ClickOutside
                position="relative"
                width={textInputWidthComputed}
                // @ts-ignore
                reactRoot={document.getElementById(rootId)}
                onClickOutside={close}
            >
                <TextInput
                    autoFocus={autoFocus}
                    height={textInputHeight}
                    value={value ?? dateText}
                    onChange={formatDateText}
                    onFocus={open}
                    onClick={isOpen ? () => {} : open}
                    onBlur={handleTextChange}
                    onKeyUp={(event: React.KeyboardEvent<HTMLInputElement>) => {
                        if (event.key == "Escape" || event.key == "Esc" || event.key == "Enter") {
                            handleTextChange();
                            close();
                        }
                    }}
                    onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                        if (
                            blurOnArrowUpDown &&
                            (event.key == "ArrowUp" || event.key == "ArrowDown")
                        ) {
                            event.currentTarget.blur();
                        }
                    }}
                    leftIcon={
                        leftIcon ??
                        (specialDateIcon && specialDateSelected ? specialDateIcon : undefined)
                    }
                    leftIconColor={
                        !leftIcon && specialDateIcon && specialDateSelected
                            ? "blue.default"
                            : undefined
                    }
                    label={label}
                    placeholder={placeholder}
                    rightIcon="arrowDown"
                    autoComplete="off"
                    disabled={disabled}
                    data-testid={dataTestId}
                    required={required}
                    error={showErrorOnInput}
                    {...inputProps}
                ></TextInput>
                {isOpen && (
                    <DropdownContent
                        position="absolute"
                        right={dropdownAlignRight ? 0 : undefined}
                        zIndex="dropdown"
                        minWidth="250px"
                        maxWidth="350px"
                    >
                        {calendarContent}
                    </DropdownContent>
                )}
            </ClickOutside>
            {showTime && (
                <Box pl={1} minWidth={timeWidth}>
                    <TimePicker
                        onChange={handleTimeChange}
                        value={
                            time !== null
                                ? {
                                      value: time,
                                      label: time,
                                  }
                                : undefined
                        }
                        date={date}
                        isClearable={false}
                        disabled={disabled}
                        // The error text is already displayed on the date input
                        // no need to display it on the time input:
                        error={Boolean(showErrorOnInput)}
                        // @ts-ignore
                        minTime={isSameDay(minDate, date) ? getTime(minDate) : null}
                        // @ts-ignore
                        maxTime={isSameDay(maxDate, date) ? getTime(maxDate) : null}
                        styles={{
                            control: (provided) => ({
                                ...provided,
                                minHeight: "42px",
                            }),
                        }}
                        data-testid={dataTestId ? `${dataTestId}-time` : undefined}
                        label={timeLabel}
                    />
                </Box>
            )}
        </Flex>
    );
};
