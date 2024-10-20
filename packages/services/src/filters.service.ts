import {addDays, endOfDay, startOfDay, tz} from "services/date";
import {RequestFilters, TzDate} from "types";

function create(dateFrom: TzDate, siteId: number, dayRange?: number): RequestFilters {
    const {start, end} = getStartAndEnd(dateFrom, dayRange);
    const result: RequestFilters = {
        site: siteId,
        start,
        end,
    };
    return result;
}

function getStartAndEnd(
    dateFrom: TzDate,
    dayRange?: number
): {end: string; endDate: TzDate; start: string; startDate: TzDate} {
    // We want to start from the beginning of the day
    const dateFromBegin = startOfDay(dateFrom);

    const siteDatePlusRange =
        dayRange !== undefined ? addDays(dateFromBegin, Math.max(0, dayRange - 1)) : dateFromBegin;
    const endOfRange = endOfDay(siteDatePlusRange);

    const timezone = dateFromBegin.timezone;
    const start = tz.dateToISO(dateFromBegin);
    const startDate = tz.convert(start, timezone);

    const end = tz.dateToISO(endOfRange);
    const endDate = tz.convert(end, timezone);
    return {
        start,
        startDate,
        end,
        endDate,
    };
}

export const filtersService = {
    create,
    getStartAndEnd,
};
