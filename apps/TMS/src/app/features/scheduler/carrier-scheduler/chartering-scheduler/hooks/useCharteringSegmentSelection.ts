import {useCallback, useState} from "react";

import {RawCarrierCharteringSchedulerSegment} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/chartering-scheduler.types";
import {DedicatedResourcesCharteringSchedulerSegment} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";

export function useCharteringSegmentSelection(
    charteringSegments:
        | RawCarrierCharteringSchedulerSegment[]
        | DedicatedResourcesCharteringSchedulerSegment[]
) {
    const [selectedCharteringSegmentUid, setCharteringSegmentUid] = useState<string | null>(null);
    const selectedCharteringSegment:
        | RawCarrierCharteringSchedulerSegment
        | DedicatedResourcesCharteringSchedulerSegment
        | undefined = charteringSegments.find((s) => s.uid === selectedCharteringSegmentUid);

    const unselectCharteringSegment = useCallback(() => {
        setCharteringSegmentUid(null);
    }, []);

    const selectCharteringSegment = useCallback((itemUid: string) => {
        setCharteringSegmentUid(itemUid);
    }, []);

    return {
        selectedCharteringSegmentUid,
        selectedTransportUid: selectedCharteringSegment?.transport.uid,
        selectCharteringSegment,
        unselectCharteringSegment,
    };
}
