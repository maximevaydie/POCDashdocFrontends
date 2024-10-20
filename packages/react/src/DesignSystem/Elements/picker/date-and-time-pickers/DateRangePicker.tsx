import {TranslationKeys, t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Flex,
    Icon,
    Popover,
    Radio,
    DropdownProps,
    RadioProps,
    Text,
    theme,
} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {getLocaleData, isValidDate} from "dashdoc-utils";
import {
    addDays,
    addMonths,
    addYears,
    endOfDay,
    endOfMonth,
    endOfWeek,
    endOfYear,
    startOfDay,
    startOfMonth,
    startOfWeek,
    startOfYear,
} from "date-fns";
import differenceInDays from "date-fns/differenceInDays";
import React, {FunctionComponent, useCallback, useMemo, useState} from "react";
import {DateRange, type Range} from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export type DateRangePickerRange = {
    startDate: Date | undefined;
    endDate: Date | undefined;
};

export type DateRangePickerStaticRange = {
    getStartDate: () => Date | undefined;
    getEndDate: () => Date | undefined;
};

export type StaticRange = {
    label: TranslationKeys;
    range: DateRangePickerStaticRange;
};

const dateDisplayFormat = "P";

export const dateRangePickerStaticRanges: Record<string, StaticRange> = {
    today: {
        label: "dateRangePicker.staticRanges.today",
        range: {
            getStartDate: () => startOfDay(new Date()),
            getEndDate: () => endOfDay(new Date()),
        },
    },
    week: {
        label: "dateRangePicker.staticRanges.thisWeek",
        range: {
            getStartDate: () => startOfWeek(new Date(), {weekStartsOn: 1}),
            getEndDate: () => endOfWeek(new Date(), {weekStartsOn: 1}),
        },
    },
    last_week: {
        label: "dateRangePicker.staticRanges.lastWeek",
        range: {
            getStartDate: () => startOfWeek(addDays(new Date(), -7), {weekStartsOn: 1}),
            getEndDate: () => endOfWeek(addDays(new Date(), -7), {weekStartsOn: 1}),
        },
    },
    month: {
        label: "dateRangePicker.staticRanges.thisMonth",
        range: {
            getStartDate: () => startOfMonth(new Date()),
            getEndDate: () => endOfMonth(new Date()),
        },
    },
    last_month: {
        label: "dateRangePicker.staticRanges.lastMonth",
        range: {
            getStartDate: () => startOfMonth(addMonths(new Date(), -1)),
            getEndDate: () => endOfMonth(addMonths(new Date(), -1)),
        },
    },
    around_today: {
        label: "dateRangePicker.staticRange.from_d_minus_1_to_d_plus_1",
        range: {
            getStartDate: () => startOfDay(addDays(new Date(), -1)),
            getEndDate: () => endOfDay(addDays(new Date(), 1)),
        },
    },
    short_week: {
        label: "dateRangePicker.staticRange.from_d_minus_1_to_d_plus_3",
        range: {
            getStartDate: () => startOfDay(addDays(new Date(), -1)),
            getEndDate: () => endOfDay(addDays(new Date(), 3)),
        },
    },
    long_week: {
        label: "dateRangePicker.staticRange.from_d_minus_1_to_d_plus_6",
        range: {
            getStartDate: () => startOfDay(addDays(new Date(), -1)),
            getEndDate: () => endOfDay(addDays(new Date(), 6)),
        },
    },
    year: {
        label: "dateRangePicker.staticRanges.thisYear",
        range: {
            getStartDate: () => startOfYear(addYears(new Date(), -1)),
            getEndDate: () => endOfYear(addYears(new Date(), -1)),
        },
    },
};

export const dateRangePickerDefaultStaticRanges: Record<string, StaticRange> = {
    today: dateRangePickerStaticRanges["today"],
    last_week: dateRangePickerStaticRanges["last_week"],
    last_month: dateRangePickerStaticRanges["last_month"],
    around_today: dateRangePickerStaticRanges["around_today"],
    short_week: dateRangePickerStaticRanges["short_week"],
    long_week: dateRangePickerStaticRanges["long_week"],
};

export const CalendarStyles = styled("div")`
    .rdrCalendarWrapper {
        width: 100%;
        color: ${theme.colors.grey.ultradark};
    }
    .rdrDateDisplayWrapper {
        background: none;
    }
    .rdrMonthAndYearWrapper {
        padding-top: 0;
    }
    .rdrMonth {
        width: 100%;
    }
    .rdrMonthPicker,
    .rdrYearPicker {
        margin: 0;
        width: 100%;
    }
    .rdrMonthAndYearPickers select {
        padding: 3px 20px 3px 3px;
        width: 100%;
        text-align: center;
        text-align-last: center;
    }
    .rdrDayPassive {
        pointer-events: unset;
    }
`;

const rangeColors = [
    theme.colors.blue.default,
    theme.colors.turquoise.default,
    theme.colors.blue.dark,
];

export type DateRangePickerProps = {
    leftIcon?: DropdownProps["leftIcon"] | null;
    label?: DropdownProps["label"];
    range: DateRangePickerRange;
    onChange: (range: DateRangePickerRange, meta: {staticRange?: string}) => void;
    staticRanges?: Record<string, StaticRange>;
    radioOptions?: {label: string; value: string}[];
    radioOptionsName?: RadioProps["name"];
    radioOptionsValue?: RadioProps["value"];
    onRadioOptionsChange?: RadioProps["onChange"];
    "data-testid"?: string;
    selectionOnly?: boolean;
    rootId?: string;
};

export const DateRangePicker: FunctionComponent<DateRangePickerProps> = (props) => {
    const localeData = getLocaleData();

    const {
        leftIcon = "calendar",
        label = t("dateRangePicker.label"),
        range,
        onChange,
        staticRanges = dateRangePickerDefaultStaticRanges,
        radioOptions = [],
        radioOptionsName,
        radioOptionsValue,
        onRadioOptionsChange,
        "data-testid": dataTestId,
        selectionOnly,
        rootId,
    } = props;
    const [isOpen, setIsOpen] = useState(false);
    const handleChange = useCallback(
        (
            startDate: Date | undefined,
            endDate: Date | undefined,
            staticRange?: string,
            closeOnChange?: true
        ) => {
            const range = {
                startDate:
                    startDate && isValidDate(startDate)
                        ? fillIncompleteYear(startOfDay(startDate))
                        : undefined,
                endDate:
                    endDate && isValidDate(endDate)
                        ? fillIncompleteYear(endOfDay(endDate))
                        : undefined,
            };
            const meta = staticRange ? {staticRange} : {};
            onChange(range, meta);
            closeOnChange && setIsOpen(false);
        },
        [onChange, setIsOpen]
    );

    const ranges: Range[] = useMemo(() => {
        if (range["startDate"] === undefined) {
            /**
             * Handle the case where the date range is not set.
             * It seems there is not straightforward way to have an empty date range.
             * This is a hacking way to have an empty date range.
             * @see https://github.com/hypeserver/react-date-range/issues/330
             */
            const invalidDate = new Date("");
            const emptyRange = {
                startDate: undefined,
                endDate: invalidDate,
                key: "selection",
            };
            return [emptyRange];
        }
        return [
            {
                ...range,
                key: "selection",
            },
        ];
    }, [range]);

    const content = (
        <Box data-testid="filters-period-content">
            {!!radioOptions.length && (
                <Box py={3} borderBottom="1px solid" borderColor="grey.light">
                    {radioOptions.map(({label, value}) => (
                        <Box px={3} key={`${label}-${value}`}>
                            <Radio
                                name={radioOptionsName}
                                label={label}
                                value={value}
                                onChange={onRadioOptionsChange}
                                checked={radioOptionsValue === value}
                            />
                        </Box>
                    ))}
                </Box>
            )}
            {!!Object.keys(staticRanges).length && (
                <Box p={4}>
                    {Object.keys(staticRanges).map((key) => (
                        <Button
                            key={key}
                            variant="plain"
                            width={1}
                            justifyContent="flex-start"
                            onClick={() => {
                                const startDate = staticRanges[key].range?.getStartDate();
                                const endDate = staticRanges[key].range?.getEndDate();
                                const staticRange = key;
                                const closeOnChange = true;
                                handleChange(startDate, endDate, staticRange, closeOnChange);
                            }}
                        >
                            <Flex
                                alignItems="baseline"
                                justifyContent={"space-between"}
                                width="100%"
                            >
                                <Text color="inherit">{t(staticRanges[key].label)}</Text>
                                {staticRanges[key].range?.getEndDate() &&
                                    staticRanges[key].range?.getStartDate() && (
                                        <Text color="grey.dark" ml={4} variant="caption">
                                            {t("common.XDays", {
                                                smart_count:
                                                    differenceInDays(
                                                        staticRanges[
                                                            key
                                                        ].range?.getEndDate() as Date,
                                                        staticRanges[
                                                            key
                                                        ].range?.getStartDate() as Date
                                                    ) + 1,
                                            })}
                                        </Text>
                                    )}
                            </Flex>
                        </Button>
                    ))}
                </Box>
            )}
            <CalendarStyles>
                <DateRange
                    ranges={ranges}
                    onChange={({
                        selection: {startDate, endDate},
                    }: {
                        selection: {startDate: Date; endDate: Date};
                    }) => {
                        handleChange(startDate, endDate);
                    }}
                    editableDateInputs={true}
                    locale={localeData}
                    startDatePlaceholder={t("dateRangePicker.startDatePlaceholder")}
                    endDatePlaceholder={t("dateRangePicker.endDatePlaceholder")}
                    dateDisplayFormat={dateDisplayFormat}
                    color={theme.colors.blue.default}
                    rangeColors={rangeColors}
                />
            </CalendarStyles>
        </Box>
    );

    return selectionOnly ? (
        content
    ) : (
        <Popover visibility={{isOpen, onOpenChange: setIsOpen}} placement="bottom-start">
            <Popover.Trigger zIndex={0}>
                <Button
                    variant="secondary"
                    width={1}
                    display="flex"
                    justifyContent="space-between"
                    data-testid={dataTestId}
                >
                    {leftIcon && <Icon name={leftIcon} mr={2} />}
                    {label}
                    <Icon name="arrowDown" ml={4} />
                </Button>
            </Popover.Trigger>
            <Popover.Content rootId={rootId}>{content}</Popover.Content>
        </Popover>
    );
};

/**
 * Fill incomplete year (e.g. 24 -> 2024)
 * @param date
 * @returns `date` date with year filled
 */
const fillIncompleteYear = (date: Date): Date => {
    if (date.getFullYear() < 100) {
        date.setFullYear(2000 + date.getFullYear());
    }
    return date;
};
