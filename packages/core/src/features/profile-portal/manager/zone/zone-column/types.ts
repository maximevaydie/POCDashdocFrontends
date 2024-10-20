import {Slot} from "types";

export type GridSlotValue = {
    slots: Slot[];
    inOpeningHours: boolean;
    opening: boolean;
    closing: boolean;
};
