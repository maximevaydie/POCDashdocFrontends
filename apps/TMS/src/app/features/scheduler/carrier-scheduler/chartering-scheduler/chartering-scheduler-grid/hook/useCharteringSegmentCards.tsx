import {useTimezone} from "@dashdoc/web-common";
import {SchedulerCard} from "@dashdoc/web-ui";
import {SchedulerCardSettingsData, parseAndZoneDate} from "dashdoc-utils";

import {CardLineHeight} from "app/features/scheduler/carrier-scheduler/components/card-content/cardLineHeights.constants";
import {DedicatedResourcesCharteringSchedulerSegment} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";
import {useSchedulerCardSettings} from "app/features/scheduler/carrier-scheduler/hooks/useSchedulerCardSettings";

import {RawCarrierCharteringSchedulerSegment} from "../chartering-scheduler.types";

export function useCharteringSegmentCards(
    charteringSegments: RawCarrierCharteringSchedulerSegment[]
): SchedulerCard[] {
    const timezone = useTimezone();
    const schedulerCardSettings = useSchedulerCardSettings();
    const cards: SchedulerCard[] = charteringSegments.map((charteringSegment) => ({
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
        resourceUid: charteringSegment.carrier?.toString(),
        sortOrder: 0,
        height: getCardHeight(schedulerCardSettings, charteringSegment),
        draggable: false,
    })) as SchedulerCard[];

    return cards;
}

export function getCardHeight(
    schedulerCardSettings: SchedulerCardSettingsData,
    charteringSegment:
        | RawCarrierCharteringSchedulerSegment
        | DedicatedResourcesCharteringSchedulerSegment
) {
    const {
        display_shipper_name,
        display_activities,
        display_vehicle_requested,
        display_global_instructions,
        display_tags,
        display_tag_text,
    } = schedulerCardSettings;
    let height = 6;
    if (display_shipper_name) {
        height += CardLineHeight.shipper;
    }
    if (display_activities) {
        height += CardLineHeight.activity * 2;
    }
    const show_vehicle_requested =
        display_vehicle_requested && charteringSegment.transport.requested_vehicle;
    const show_instructions =
        display_global_instructions && charteringSegment.transport.instructions;

    if (display_activities && (show_vehicle_requested || show_instructions)) {
        height += CardLineHeight.spaceAfterActivities;
    }

    if (show_vehicle_requested) {
        height += CardLineHeight.vehicleRequested;
    }
    if (show_instructions) {
        height += CardLineHeight.instructions;
    }

    const has_tags = charteringSegment && charteringSegment.transport.tags?.length > 0;

    if (has_tags && display_tags) {
        if (display_tag_text) {
            height += CardLineHeight.tagsWithText;
        } else {
            height += CardLineHeight.tagsWithoutText;
        }
    }

    return Math.max(30, height);
}
