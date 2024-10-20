import {useTimezone} from "@dashdoc/web-common";
import {parseAndZoneDate} from "dashdoc-utils";
import {endOfDay, startOfDay} from "date-fns";
import sortBy from "lodash.sortby";
import React from "react";

import {SendInstructionStatus} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/send-instructions/SendInstructionsStatus";

import {RawCarrierCharteringSchedulerSegment} from "../chartering-scheduler.types";

export function DayActionButton({
    day,
    currentDate,
    charteringSegments,
    allCompaniesLoaded,
    isLoadingCompanies,
    loadAllCompanies,
    isLoadingSegments,
    fetchCharteringSegmentsByUIDs,
}: {
    day: Date;
    currentDate: Date;
    charteringSegments: RawCarrierCharteringSchedulerSegment[];
    allCompaniesLoaded: boolean;
    isLoadingCompanies: boolean;
    loadAllCompanies: () => void;
    isLoadingSegments: boolean;
    fetchCharteringSegmentsByUIDs: (uids: string[]) => Promise<void>;
}) {
    const notSentSegments = useNotSentSegments(charteringSegments, day);
    return (
        <SendInstructionStatus
            day={day}
            currentDate={currentDate}
            notSentSegments={notSentSegments}
            allRowsLoaded={allCompaniesLoaded}
            loadAllRows={loadAllCompanies}
            isLoadingRows={isLoadingCompanies}
            isLoadingSegments={isLoadingSegments}
            onInstructionsSent={(uids) => fetchCharteringSegmentsByUIDs(uids.split(","))}
        />
    );
}

function useNotSentSegments(
    charteringSegments: RawCarrierCharteringSchedulerSegment[],
    day: Date
) {
    const timezone = useTimezone();
    const notSentCharteringSegments = charteringSegments.filter(
        (segment) =>
            isDuringDay(segment, day, timezone) &&
            (segment.status === "planned_but_not_sent" ||
                segment.status === "draft_assigned_to_charter")
    );
    const sortedSegments = sortBy(
        notSentCharteringSegments,
        (s) => s.scheduler_datetime_range.start
    );
    return sortedSegments;
}

function isDuringDay(segment: RawCarrierCharteringSchedulerSegment, day: Date, timezone: string) {
    const tripStartDate = parseAndZoneDate(segment.scheduler_datetime_range.start, timezone);
    const tripEndDate = parseAndZoneDate(segment.scheduler_datetime_range.end, timezone);
    const startDay = startOfDay(day);
    const endDay = endOfDay(day);

    return tripStartDate && tripEndDate && startDay <= tripEndDate && tripStartDate <= endDay;
}
