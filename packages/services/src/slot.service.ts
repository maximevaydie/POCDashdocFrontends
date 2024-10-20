import {t} from "@dashdoc/web-core";
import {SlotTime} from "features/slot/actions/slot-booking/step/types";
import {differenceInMinutes, isBefore, isSameMinute, tz} from "services/date";
import {Slot, SlotCustomField, SlotState, Zone} from "types";

function isLate(slot: Slot, timezone: string) {
    if (slot.state !== "planned") {
        return false;
    }
    const nowOnSite = tz.now(timezone);
    const slotEndTime = tz.convert(slot.end_time, timezone);
    return isBefore(slotEndTime, nowOnSite);
}

// Departed slots are considered as completed (it's a final state)
function isCompletedOrCancelled(slot: Slot) {
    return slot.state === "completed" || slot.state === "cancelled";
}

type SlotStateOrLate = SlotState | "late";

function getSlotStateDisplay(slot: Slot, timezone: string) {
    let state: SlotStateOrLate = slot.state;
    if (isLate(slot, timezone)) {
        state = "late";
    }

    const statesToDisplay: Record<
        SlotStateOrLate,
        {
            text: string;
            smallBadgeColor: string | null;
            bigBadgeBgColor: string | null;
            bigBadgeTextColor: string | null;
        }
    > = {
        planned: {
            text: t("flow.slotState.planned"),
            smallBadgeColor: null,
            bigBadgeBgColor: null,
            bigBadgeTextColor: null,
        },
        arrived: {
            text: t("flow.slotState.arrived"),
            smallBadgeColor: "purple.default",
            bigBadgeBgColor: "purple.ultralight",
            bigBadgeTextColor: "purple.dark",
        },
        handled: {
            text: t("flow.slotState.handling"),
            smallBadgeColor: "purple.default",
            bigBadgeBgColor: "purple.ultralight",
            bigBadgeTextColor: "purple.dark",
        },
        completed: {
            text: t("flow.slotState.completed"),
            smallBadgeColor: "green.default",
            bigBadgeBgColor: "green.ultralight",
            bigBadgeTextColor: "green.dark",
        },
        cancelled: {
            text: t("flow.slotState.cancelled"),
            smallBadgeColor: "red.default",
            bigBadgeBgColor: "red.ultralight",
            bigBadgeTextColor: "red.dark",
        },
        late: {
            text: t("flow.slotState.late"),
            smallBadgeColor: "red.default",
            bigBadgeBgColor: "red.ultralight",
            bigBadgeTextColor: "red.dark",
        },
    };

    return statesToDisplay[state];
}

function sort(slots: Slot[], timezone: string) {
    const result = slots.sort((a, b) => {
        const startTimeA = tz.convert(a.start_time, timezone);
        const startTimeB = tz.convert(b.start_time, timezone);
        if (isSameMinute(startTimeA, startTimeB)) {
            // same time, let's sort by id
            return a.id < b.id ? -1 : 1;
        }
        return isBefore(startTimeA, startTimeB) ? -1 : 1;
    });
    return result;
}

function isIrregular(slot: Slot, zone: Zone, timezone: string) {
    const startTime = tz.convert(slot.start_time, timezone);
    const endTime = tz.convert(slot.end_time, timezone);
    const diff = differenceInMinutes(endTime, startTime);
    const isIrregular = diff !== zone.slot_duration;
    return isIrregular;
}

function getSlotTime(slot: Slot, zone: Zone, timezone: string): SlotTime {
    if (slotServices.isIrregular(slot, zone, timezone)) {
        return {startTime: slot.start_time, endTime: slot.end_time};
    }
    return {startTime: slot.start_time};
}

/**
 * We return only the custom fields that are visible on the card.
 */
function getCardCustomFields(slot: Slot, zone: Zone) {
    const customFieldSpecs =
        zone.custom_fields?.filter((fieldDesc) => fieldDesc.visible_on_card) ?? [];
    const customFields = customFieldSpecs
        .map((customFieldSpec) => {
            const customField = slot.custom_fields?.find(
                (aField) =>
                    aField.id === customFieldSpec.id && aField.label === customFieldSpec.label
            );
            return customField;
        })
        .filter((field) => field !== undefined) as SlotCustomField[];
    return customFields;
}

export const slotServices = {
    isLate,
    sort,
    isCompletedOrCancelled,
    getSlotStateDisplay,
    isIrregular,
    getSlotTime,
    getCardCustomFields,
};
