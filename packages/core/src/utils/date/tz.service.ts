import {Logger} from "@dashdoc/web-core";
// eslint-disable-next-line no-restricted-imports
import {formatDate, zoneDateToISO} from "dashdoc-utils";
import {TzDate} from "types";

/**
 * Return a Timezoned date with the current time
 */
function now(timezone: string): TzDate {
    const nowOnBrowser = new Date();
    return convert(nowOnBrowser, timezone);
}

/**
 * Return a new TzDate with the same value
 */
function clone(date: TzDate): TzDate {
    const tzDate = new Date(date) as TzDate;
    tzDate.timezone = date.timezone;
    return tzDate;
}

/**
 * Encode a date to ISO string
 */
function dateToISO(date: TzDate): string {
    const result = zoneDateToISO(date, date.timezone) as string;
    return result;
}

/**
 * Convert a date (from a string or a date object) to a TzDate.
 */
function convert(date: string | Date, timezone: string): TzDate {
    if (date instanceof Date && "timezone" in date) {
        Logger.error("TzService.convert: date is already a TzDate");
        return date as TzDate;
    }
    const tzDate = changeTimeZone(date, timezone) as TzDate;
    tzDate.timezone = timezone;
    return tzDate;
}

/**
 * Convert a date to a new timezone.
 * Basically, convert a date given by the browser (with the browser timezone) to a date with the given timezone.
 * This is a private function, it should not be used outside of this service.
 */
function changeTimeZone(date: Date | string, timeZone: string) {
    const dateObject = typeof date === "string" ? new Date(date) : date;
    const tzString = dateObject.toLocaleString("en-US", {
        timeZone,
    });
    return new Date(tzString);
}

/**
 * Format a TzDate to a string
 */
function format(date: TzDate | {date: string; timezone: string}, format: string): string {
    const tzDate = "date" in date ? convert(date.date, date.timezone) : date;
    return formatDate(tzDate, format, {
        timeZone: date.timezone,
    });
}

export const tzService = {now, clone, format, dateToISO, convert};
