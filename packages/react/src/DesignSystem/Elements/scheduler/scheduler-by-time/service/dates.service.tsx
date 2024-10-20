import {
    startOfDay,
    endOfDay,
    endOfMinute,
    eachDayOfInterval,
    isSaturday,
    isSunday,
    max,
} from "date-fns";
import {differenceInMinutes} from "date-fns";

import {COLLAPSED_TIME_WIDTH, TIME_CELL_WIDTH} from "../../gridStyles";

function getDatesSection({
    start,
    end,
    minuteScale,
    hideSaturdays,
    hideSundays,
    timeRange,
}: {
    start: Date;
    end: Date;
    minuteScale: number; // scale in minutesPerDay
    hideSaturdays: boolean;
    hideSundays: boolean;
    timeRange: {start: string; end: string} | null;
}) {
    // compute all visible date range sections of the planning according times and weekends to hide
    if (hideSaturdays || hideSundays || timeRange) {
        // Get the list of days within the selected period
        let days = eachDayOfInterval({start: startOfDay(start), end: endOfDay(end)});

        let currentSection: {start: Date; end: Date} | null = null;
        let sections: Array<{start: Date; end: Date}> = [];
        const displayTimeRange = _getDisplayTimeRangeAccordingZoom(timeRange, minuteScale);

        // Go through each day and create a new section each time we encounter a period to hide
        days.map((day) => {
            // Check for each day
            if ((hideSaturdays && isSaturday(day)) || (hideSundays && isSunday(day))) {
                // if day is saturday or sunday and should be hidden
                // then we should end the section and start a new one after
                if (currentSection) {
                    sections.push(currentSection);
                    currentSection = null;
                }
            } else if (displayTimeRange) {
                // if there is a timeRange to display per day,
                // then create a new section per day
                sections.push({
                    start: _getDayAtTime(day, displayTimeRange.start),
                    end: endOfMinute(_getDayAtTime(day, displayTimeRange.end)),
                });
            } else if (currentSection === null) {
                // otherwise init a new section at current day
                currentSection = {start: startOfDay(day), end: endOfDay(day)};
            } else {
                // and update end day until we reach a hidden period
                currentSection.end = endOfDay(day);
            }
        });
        // add last computed section in the list
        if (currentSection) {
            sections.push(currentSection);
        }
        return sections;
    }

    return [{start: startOfDay(start), end: endOfDay(end)}];
}

function _getDayAtTime(day: Date, time: string) {
    const date = new Date(day);
    const [hours, minutes] = time.split(":");
    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));
    return date;
}

function _getDisplayTimeRangeAccordingZoom(
    timeRange: {start: string; end: string} | null,
    minutesPerCell: number
) {
    // We compute the smallest interval that contains the selected timeRange with full pair cells.
    // eg: timeRange = 08:15 -> 20:45 with zoom set to have 1 cell = 1 hour (so 1 pair of cells = 2 hours)
    // Then the range display will be : 8:00 -> 22:00
    if (!timeRange || (timeRange.start == "00:00" && timeRange.end === "23:59")) {
        return null;
    }
    const startMinutes = _getMinutesFromTime(timeRange.start);
    const roundedStartMinutes =
        Math.floor(startMinutes / (minutesPerCell * 2)) * (minutesPerCell * 2); // we want to keep the first pair of cells that include the time range chosen
    const roundedStart = _getTimeFromMinutes(roundedStartMinutes);

    const endMinutes = _getMinutesFromTime(timeRange.end);
    const roundedEndMinutes = Math.ceil(endMinutes / (minutesPerCell * 2)) * (minutesPerCell * 2); // we want to keep the last pair of cells that include the time range chosen
    let roundedEnd = _getTimeFromMinutes(roundedEndMinutes - 1);

    if (roundedStart == "00:00" && roundedEnd === "23:59") {
        return null;
    }
    return {start: roundedStart, end: roundedEnd};
}

function getDisplayDateRangeAccordingZoom(
    start: Date,
    end: Date,
    timeRange: {start: string; end: string} | null,
    minutesPerCell: number
) {
    const displayTimeRange = _getDisplayTimeRangeAccordingZoom(timeRange, minutesPerCell);

    if (displayTimeRange) {
        return {
            start: _getDayAtTime(start, displayTimeRange.start),
            end: endOfMinute(_getDayAtTime(end, displayTimeRange.end)),
        };
    }
    return {
        start: startOfDay(start),
        end: endOfDay(end),
    };
}

function _getTimeFromMinutes(minutes: number) {
    // return time formatted as HH:mm
    const hours = Math.floor(minutes / 60);
    const min = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function _getMinutesFromTime(time: string) {
    // get time formatted as HH:mm
    const [hour, minute] = time.split(":");
    return Number(hour) * 60 + Number(minute);
}

function getDayWidth(start: Date, end: Date, minuteScale: number) {
    const cellsNumber = Math.floor(differenceInMinutes(end, start) / minuteScale) + 1;
    return TIME_CELL_WIDTH * cellsNumber;
}

function getRowWidth(start: Date, end: Date, minuteScale: number) {
    const cellsNumber = differenceInMinutes(end, start) / minuteScale;
    return TIME_CELL_WIDTH * cellsNumber;
}

function getEndDateFromStartDateAndWidth(
    startDate: Date,
    width: number,
    minuteScale: number,
    dateSections: Array<{start: Date; end: Date}>
) {
    // Get end date from a start date and a scheduler width
    const endDate = new Date(startDate);
    const widthToMinutesFactor = minuteScale / TIME_CELL_WIDTH;

    let remainingWidth = width;
    let minutesToAdd = 0;
    let dateSectionsIndex = getSectionIndex(dateSections, startDate);
    if (dateSectionsIndex === -1) {
        dateSectionsIndex = 0;
    }
    while (remainingWidth > 0 && dateSectionsIndex < dateSections.length) {
        // compute duration over visible date Section
        const section = dateSections[dateSectionsIndex];
        const widthInsideSection =
            differenceInMinutes(section.end, max([section.start, startDate])) /
            widthToMinutesFactor;
        const widthToRemoveInsideSection = Math.min(widthInsideSection, remainingWidth);

        minutesToAdd += widthToRemoveInsideSection * widthToMinutesFactor;
        remainingWidth -= widthToRemoveInsideSection;

        // compute duration over collapsed zone
        if (remainingWidth > 0 && dateSectionsIndex < dateSections.length - 1) {
            const nextSection = dateSections[dateSectionsIndex + 1];
            minutesToAdd += differenceInMinutes(nextSection.start, section.end);
            remainingWidth -= COLLAPSED_TIME_WIDTH;
        }

        dateSectionsIndex += 1;
    }
    endDate.setMinutes(endDate.getMinutes() + minutesToAdd);

    return endDate;
}

function getSectionIndex(dateSections: Array<{start: Date; end: Date}>, date: Date) {
    return dateSections.findIndex((section) => section.start <= date && date <= section.end);
}

export const schedulerDatesService = {
    getDatesSection,
    getRowWidth,
    getDayWidth,
    getSectionIndex,
    getEndDateFromStartDateAndWidth,
    getDisplayDateRangeAccordingZoom,
};
