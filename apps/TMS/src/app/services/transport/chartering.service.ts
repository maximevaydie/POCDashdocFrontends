import type {Activity, Segment, Site, SubcontractingChildTransport} from "app/types/transport";
import type {ActivityTurnoverData} from "dashdoc-utils";

export function getChildTransportCost(childTransport: SubcontractingChildTransport) {
    return childTransport.prices?.total ? parseFloat(childTransport.prices.total) : null;
}

export function getSubcontractingCostOfActivities(
    childTransportCost: number | null,
    meanTurnover: ActivityTurnoverData | null
) {
    if (!childTransportCost) {
        return null;
    }
    if (meanTurnover?.weight_in_subcontracting) {
        return childTransportCost * parseFloat(meanTurnover.weight_in_subcontracting);
    }
    return childTransportCost;
}

export function getSegmentUidsToCharter(
    activities: Activity[],
    breakSite: Site | undefined,
    segmentFromBreakSite?: Segment | undefined
) {
    let segmentsUids: string[] = [];
    if (breakSite && activities.length === 0) {
        segmentsUids = segmentFromBreakSite ? [segmentFromBreakSite.uid] : [];
    } else {
        segmentsUids = Object.values(
            activities.reduce((acc: Record<string, string>, {previousSegment, nextSegment}) => {
                if (previousSegment) {
                    acc[previousSegment.uid] = previousSegment.uid;
                }
                if (nextSegment) {
                    acc[nextSegment.uid] = nextSegment.uid;
                }
                return acc;
            }, {})
        );
    }
    return segmentsUids;
}
