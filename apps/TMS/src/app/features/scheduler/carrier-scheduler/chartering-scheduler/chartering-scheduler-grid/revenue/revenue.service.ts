import {parseAndZoneDate} from "dashdoc-utils";
import {endOfDay, startOfDay} from "date-fns";
import sumBy from "lodash.sumby";

import {
    DedicatedResourcesCharteringSchedulerSegment,
    DedicatedResourcesView,
} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";

import {CharteringView, RawCarrierCharteringSchedulerSegment} from "../chartering-scheduler.types";

export function getTurnoverByResource(
    resourceUid: string,
    charteringSegments:
        | RawCarrierCharteringSchedulerSegment[]
        | DedicatedResourcesCharteringSchedulerSegment[],
    startDate: Date,
    endDate: Date,
    timezone: string,
    viewType: CharteringView | DedicatedResourcesView
) {
    return sumBy(charteringSegments, (segment) => {
        if (viewType === "chartering" && segment.carrier?.toString() === resourceUid) {
            return _getSegmentRevenue(segment, startDate, endDate, timezone);
        }

        if (
            viewType === "dedicated_resources" &&
            (segment as DedicatedResourcesCharteringSchedulerSegment).trucker_id &&
            `trucker-${(segment as DedicatedResourcesCharteringSchedulerSegment).trucker_id}` ===
                resourceUid
        ) {
            return _getSegmentRevenue(segment, startDate, endDate, timezone);
        }

        return 0;
    });
}
export function getTotalTurnover(
    charteringSegments:
        | RawCarrierCharteringSchedulerSegment[]
        | DedicatedResourcesCharteringSchedulerSegment[],
    startDate: Date,
    endDate: Date,
    timezone: string,
    viewType: CharteringView | DedicatedResourcesView
) {
    return sumBy(charteringSegments, (segment) => {
        if (
            viewType === "chartering" &&
            (segment as RawCarrierCharteringSchedulerSegment).carrier
        ) {
            return _getSegmentRevenue(segment, startDate, endDate, timezone);
        }

        if (
            viewType === "dedicated_resources" &&
            (segment as DedicatedResourcesCharteringSchedulerSegment).trucker_id
        ) {
            return _getSegmentRevenue(segment, startDate, endDate, timezone);
        }

        return 0;
    });
}

function _getSegmentRevenue(
    segment: RawCarrierCharteringSchedulerSegment | DedicatedResourcesCharteringSchedulerSegment,
    startDate: Date,
    endDate: Date,
    timezone: string
) {
    const segmentStartDate = parseAndZoneDate(segment.scheduler_datetime_range.start, timezone);
    if (
        segmentStartDate &&
        startOfDay(startDate) <= segmentStartDate &&
        segmentStartDate <= endOfDay(endDate)
    ) {
        return segment.agreed_price ?? 0;
    }
    return 0;
}
