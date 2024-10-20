import {formatDate, parseAndZoneDate} from "dashdoc-utils";

export function getRestTimeText(rest: {start?: string; end?: string}, timezone: string) {
    if (!rest.start || !rest.end) {
        return null;
    }
    const startZonedDate = parseAndZoneDate(rest.start, timezone);
    const endZonedDate = parseAndZoneDate(rest.end, timezone);
    const startDate = formatDate(startZonedDate, "PPPP");
    const startTime = formatDate(startZonedDate, "p");
    const endDate = formatDate(endZonedDate, "PPPP");
    const endTime = formatDate(endZonedDate, "p");

    if (startDate === endDate) {
        return `${startDate}, ${startTime} - ${endTime}`;
    }
    return `${startDate}, ${startTime} - ${endDate}, ${endTime}`;
}
