/* eslint-disable no-restricted-imports */
import {t} from "@dashdoc/web-core";
import {
    Duration as DurationFromFNS,
    addDays as addDaysFromFNS,
    addHours as addHoursFromFNS,
    addMinutes as addMinutesFromFNS,
    addMonths as addMonthsFromFNS,
    differenceInMinutes as differenceInMinutesFromFNS,
    endOfDay as endOfDayFromFNS,
    endOfMonth as endOfMonthFromFNS,
    endOfWeek as endOfWeekFromFNS,
    getHours as getHoursFromFNS,
    intervalToDuration as intervalToDurationFromFNS,
    isAfter as isAfterFromFNS,
    isBefore as isBeforeFromFNS,
    isSameDay as isSameDayFromFNS,
    isSameHour as isSameHourFromFNS,
    isSameMinute as isSameMinuteFromFNS,
    isSameSecond as isSameSecondFromFNS,
    isSameWeek as isSameWeekFromFNS,
    startOfDay as startOfDayFromFNS,
    startOfHour as startOfHourFromFNS,
    startOfMonth as startOfMonthFromFNS,
    subDays as subDaysFromFNS,
} from "date-fns";
import {TzDate, Weekday} from "types";

export function addMinutes(date: TzDate, amount: number) {
    const result = addMinutesFromFNS(date, amount);
    return asTzDate(result, date.timezone);
}

export function addHours(date: TzDate, amount: number) {
    const result = addHoursFromFNS(date, amount);
    return asTzDate(result, date.timezone);
}

export function addMonths(date: TzDate, amount: number) {
    const result = addMonthsFromFNS(date, amount);
    return asTzDate(result, date.timezone);
}

export function addDays(date: TzDate, amount: number) {
    const result = addDaysFromFNS(date, amount);
    return asTzDate(result, date.timezone);
}

export function subDays(date: TzDate, amount: number) {
    const result = subDaysFromFNS(date, amount);
    return asTzDate(result, date.timezone);
}

export function startOfMonth(date: TzDate) {
    const result = startOfMonthFromFNS(date);
    return asTzDate(result, date.timezone);
}

export function startOfDay(date: TzDate) {
    const result = startOfDayFromFNS(date);
    return asTzDate(result, date.timezone);
}

export function startOfHour(date: TzDate) {
    const result = startOfHourFromFNS(date);
    return asTzDate(result, date.timezone);
}

export function endOfMonth(date: TzDate) {
    const result = endOfMonthFromFNS(date);
    return asTzDate(result, date.timezone);
}

export function endOfDay(date: TzDate) {
    const result = endOfDayFromFNS(date);
    return asTzDate(result, date.timezone);
}

export function endOfWeek(
    date: TzDate,
    options?: {
        locale?: Locale;
        weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    }
) {
    const result = endOfWeekFromFNS(date, options);
    return asTzDate(result, date.timezone);
}

export function isSameSecond(dateLeft: TzDate, dateRight: TzDate) {
    return isSameSecondFromFNS(dateLeft, dateRight);
}

export function isSameMinute(dateLeft: TzDate, dateRight: TzDate) {
    return isSameMinuteFromFNS(dateLeft, dateRight);
}

export function isSameHour(dateLeft: TzDate, dateRight: TzDate) {
    return isSameHourFromFNS(dateLeft, dateRight);
}

export function isSameDay(dateLeft: TzDate, dateRight: TzDate) {
    return isSameDayFromFNS(dateLeft, dateRight);
}

export function isSameWeek(dateLeft: TzDate, dateRight: TzDate) {
    return isSameWeekFromFNS(dateLeft, dateRight);
}

export function isAfter(dateLeft: TzDate, dateRight: TzDate) {
    return isAfterFromFNS(dateLeft, dateRight);
}

export function isBefore(dateLeft: TzDate, dateRight: TzDate) {
    return isBeforeFromFNS(dateLeft, dateRight);
}

export function interval(dateLeft: TzDate, dateRight: TzDate) {
    const result: Duration = intervalToDurationFromFNS({
        start: dateLeft,
        end: dateRight,
    });
    return result;
}

export function differenceInMinutes(dateLeft: TzDate, dateRight: TzDate) {
    return differenceInMinutesFromFNS(dateLeft, dateRight);
}

export function intervalString(dateLeft: TzDate, dateRight: TzDate) {
    const duration: Duration = interval(dateLeft, dateRight);
    const result: string[] = [];
    if (duration.years) {
        const label = duration.years === 1 ? t("common.year") : t("common.years");
        result.push(`${duration.years} ${label}`);
    }
    if (duration.months) {
        const label = duration.months === 1 ? t("common.month") : t("common.months");
        result.push(`${duration.months} ${label}`);
    }
    if (duration.days) {
        const label = t("common.day", {smart_count: duration.days}).toLowerCase();
        result.push(`${duration.days} ${label}`);
    }
    if (duration.hours) {
        const label = t("common.hour", {smart_count: duration.hours});
        result.push(`${duration.hours} ${label}`);
    }
    if (duration.minutes) {
        const label = t("common.minute", {smart_count: duration.minutes});
        result.push(`${duration.minutes} ${label}`);
    }
    if (duration.seconds) {
        const label = duration.seconds === 1 ? t("common.second") : t("common.seconds");
        result.push(`${duration.seconds} ${label}`);
    }
    return result.join(", ");
}

export function getHours(date: TzDate) {
    return getHoursFromFNS(date);
}

/**
 * Cast a date to a TzDate.
 * This is useful when you compute a new date from a TzDate.
 * You know that the new date is in the same timezone and you can simply cast.
 */
function asTzDate(date: Date, timezone: string) {
    const result = new Date(date) as TzDate;
    result.timezone = timezone;
    return result;
}

export type Duration = DurationFromFNS;

const WEEKDAYS: Weekday[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];
export function getWeekday(date: TzDate | null): Weekday {
    if (date === null) {
        return WEEKDAYS[0];
    }
    return WEEKDAYS[date.getDay()];
}
