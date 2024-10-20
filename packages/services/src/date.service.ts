import {parseAndZoneDate} from "dashdoc-utils";
import {endOfDay, startOfDay} from "date-fns";

function sortByCreatedDeviceDate<T extends {created_device?: string | null; created?: string}>(
    collection: Array<T>,
    reverse = false
) {
    return sortByDate(collection, "created_device", "created", reverse);
}

function sortByDate<T, K extends keyof T>(
    collection: Array<T>,
    fieldName: K,
    backupFieldName: K,
    reverse = false
): Array<T> {
    let _true = -1,
        _false = 1;
    if (reverse) {
        _true = 1;
        _false = -1;
    }

    if (!backupFieldName) {
        backupFieldName = fieldName;
    }

    return collection.sort((a, b) => {
        const aValue = a[fieldName] ? a[fieldName] : a[backupFieldName];
        const bValue = b[fieldName] ? b[fieldName] : b[backupFieldName];
        if (!aValue) {
            return _true;
        } else if (!bValue) {
            return _false;
        }
        return new Date(aValue as any) < new Date(bValue as any) ? _true : _false;
    });
}

export function isDateInconsistent(
    startDate: Date | string | null,
    endDate: Date | string | null,
    timezone: string,
    minDateString?: string,
    maxDateString?: string
) {
    const minDate = minDateString ? parseAndZoneDate(minDateString, timezone) : null;
    const maxDate = maxDateString ? parseAndZoneDate(maxDateString, timezone) : null;
    return Boolean(
        startDate &&
            endDate &&
            ((maxDate && startDate > maxDate) || (minDate && endDate < minDate))
    );
}

export function getDatetimeRangeString(startDate: Date, endDate: Date) {
    const start = startOfDay(startDate).toISOString();
    const end = endOfDay(endDate).toISOString();
    const datetimeRange = [start, end].join(",");
    return datetimeRange;
}

export function reduceDates(
    dates: (string | undefined | null)[],
    comparison: "min" | "max"
): string | undefined {
    const nonEmptyDates = dates.filter((date) => date) as string[];
    const reducedDate = nonEmptyDates
        .map((date) => new Date(date))
        .reduce((acc: Date | undefined, date) => {
            if (!date) {
                return acc;
            } else if (!acc) {
                return date;
            } else if (comparison === "max") {
                return date > acc ? date : acc;
            } else {
                return date < acc ? date : acc;
            }
        }, undefined);

    return reducedDate?.toISOString();
}

export const dateService = {
    sortByDate,
    sortByCreatedDeviceDate,
    getDatetimeRangeString,
    reduceDates,
};
