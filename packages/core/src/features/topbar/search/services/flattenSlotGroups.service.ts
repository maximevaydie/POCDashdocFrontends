import {Slot} from "types";

type SlotGroups = {
    today: Slot[];
    tomorrow: Slot[];
    thisWeek: Slot[];
    later: Slot[];
};

export function flattenSlotGroups(slotGroups: SlotGroups): Slot[] {
    let flattened: Slot[] = [];
    Object.values(slotGroups).forEach((slots) => {
        flattened = flattened.concat(slots);
    });
    return flattened;
}
