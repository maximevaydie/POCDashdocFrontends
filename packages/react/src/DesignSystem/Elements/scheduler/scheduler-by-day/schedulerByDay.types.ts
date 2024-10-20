import {DefaultMap} from "@dashdoc/web-core";

import {SchedulerCard} from "../scheduler.types";

export type SchedulerCardFormatted = SchedulerCard & {
    y: number; // vertical position in px (according other cards size)
    width: number; // how many cell the item lasts
    inconsistentOrder: boolean;
};

export class DateToCardsMap extends DefaultMap<number, SchedulerCardFormatted[]> {
    constructor() {
        super(null, () => [] as SchedulerCardFormatted[]);
    }
}

export type SideSwipeType = "right" | "left" | "top";
