import {ActivityType} from "dashdoc-utils";

import type {Activity, Delivery, Load} from "app/types/transport";

export type AddPlannedLoadData = {
    type: "AddPlannedLoadData";
    activity: Activity;
};

export type AmendAddLoadData = {
    type: "AmendAddLoadData";
    siteType: ActivityType;
    activity: Activity;
    roundId?: number;
    uid?: string;
    plannedLoad?: Load;
};

export type EditPlannedLoadData = {
    type: "EditPlannedLoadData";

    editedLoad: Load;
    editedDelivery: Delivery;
};

export type AmendEditLoadData = {
    type: "AmendEditLoadData";
    roundId?: number;
    siteType: ActivityType;
    editedLoad: Load;
    editedDelivery: Delivery;
};

export type SubmitLoadData =
    | AddPlannedLoadData
    | EditPlannedLoadData
    | AmendAddLoadData
    | AmendEditLoadData;
