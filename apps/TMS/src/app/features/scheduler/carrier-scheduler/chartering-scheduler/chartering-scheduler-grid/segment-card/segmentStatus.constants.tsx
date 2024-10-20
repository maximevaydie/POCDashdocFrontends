import {Decoration} from "app/features/scheduler/carrier-scheduler/carrierScheduler.types";
import {
    unplanned,
    plannedButNotSent,
    draftAssignedToCharter,
    plannedAndSent,
    acknowledged,
    onGoing,
    onLoadingSite,
    loadingComplete,
    onUnloadingSite,
    unloadingComplete,
    invoiced,
    done,
    declined,
    sent_to_charter,
    assigned,
    accepted_by_charter,
    cancelled,
} from "app/features/scheduler/carrier-scheduler/components/card-content/status.constants";

import {SegmentStatus} from "../chartering-scheduler.types";

export const getSegmentDecoration = (segmentStatus: SegmentStatus): Decoration => {
    const decorations = {
        unplanned: unplanned,
        planned_but_not_sent: plannedButNotSent,
        draft_assigned_to_charter: draftAssignedToCharter,
        planned_and_sent: plannedAndSent,
        acknowledged: acknowledged,
        on_going: onGoing,
        on_loading_site: onLoadingSite,
        loading_complete: loadingComplete,
        on_unloading_site: onUnloadingSite,
        unloading_complete: unloadingComplete,
        invoiced,
        done,
        declined,
        sent_to_charter,
        assigned,
        accepted_by_charter,
        cancelled,
    };
    return decorations[segmentStatus] ?? unplanned;
};
