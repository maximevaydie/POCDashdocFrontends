import {useTimezone} from "@dashdoc/web-common";
import {SchedulerCard} from "@dashdoc/web-ui";
import {parseAndZoneDate} from "dashdoc-utils";

import {getCardHeight} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/hook/useCharteringSegmentCards";
import {DedicatedResourcesCharteringSchedulerSegment} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";
import {useSchedulerCardSettings} from "app/features/scheduler/carrier-scheduler/hooks/useSchedulerCardSettings";

export function useDedicatedResourcesSegmentCards(
    charteringSegments: DedicatedResourcesCharteringSchedulerSegment[]
): SchedulerCard[] {
    const timezone = useTimezone();
    const schedulerCardSettings = useSchedulerCardSettings();
    const cards: SchedulerCard[] = charteringSegments.map((charteringSegment) => {
        return {
            itemUid: charteringSegment.uid,
            type: "charteringSegment",
            startDate: parseAndZoneDate(
                charteringSegment.scheduler_datetime_range.start,
                timezone
            ) as Date,
            endDate: parseAndZoneDate(
                charteringSegment.scheduler_datetime_range.end,
                timezone
            ) as Date,
            resourceUid: charteringSegment.trucker_id
                ? `trucker-${charteringSegment.trucker_id}`
                : undefined,
            sortOrder: 0,
            height: getCardHeight(schedulerCardSettings, charteringSegment),
            draggable: false,
        };
    }) as SchedulerCard[];
    return cards;
}
