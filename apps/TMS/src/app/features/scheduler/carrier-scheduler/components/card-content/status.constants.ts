import {TranslationKeys} from "@dashdoc/web-core";
import {IconNames} from "@dashdoc/web-ui";

import {Decoration} from "app/features/scheduler/carrier-scheduler/carrierScheduler.types";

export const StatusColors = {
    UNPLANNED: "grey.dark",
    PLANNED: "grey.dark",
    SENT: "blue.default",
    ACKNOWLEDGED: "blue.default",
    ON_GOING: "purple.default",
    DONE: "green.default",
    VERIFIED: "grey.dark",
    INVOICED: "grey.dark",
    CANCELLED: "red.dark",
};
const LightStatusColors = {
    UNPLANNED: "grey.light",
    PLANNED: "grey.light",
    SENT: "blue.ultralight",
    ACKNOWLEDGED: "blue.ultralight",
    ON_GOING: "purple.ultralight",
    DONE: "green.ultralight",
    VERIFIED: "grey.light",
    INVOICED: "grey.light",
    CANCELLED: "red.ultralight",
};
const MediumStatusColors = {
    UNPLANNED: "grey.default",
    PLANNED: "grey.default",
    SENT: "blue.light",
    ACKNOWLEDGED: "blue.light",
    ON_GOING: "purple.light",
    DONE: "green.light",
    VERIFIED: "grey.default",
    INVOICED: "grey.default",
    CANCELLED: "red.light",
};

export const unplanned: Decoration = {
    color: StatusColors.UNPLANNED,
    backgroundColor: LightStatusColors.UNPLANNED,
    darkerBackground: MediumStatusColors.UNPLANNED,
};

// Given a segment in the schedule for carrier, When the segment is planned but not yet sent to a trucker,
export const plannedButNotSent: Decoration = {
    color: StatusColors.PLANNED,
    backgroundColor: LightStatusColors.PLANNED,
    darkerBackground: MediumStatusColors.PLANNED,
    statusIcon: "simpleCalendar",
    statusLabel: "siteStatusBadgde.planned",
};

// Given a segment in the scheduler, When the segment is planned but not yet sent to a charterer,
export const draftAssignedToCharter: Decoration = {
    color: StatusColors.UNPLANNED,
    backgroundColor: LightStatusColors.UNPLANNED,
    darkerBackground: MediumStatusColors.UNPLANNED,
    statusIcon: "simpleCalendar",
    statusLabel: "siteStatusBadgde.planned",
};

// Given a segment in the schedule for carrier, When the segment is planned and sent to a trucker,
export const plannedAndSent: Decoration = {
    color: StatusColors.SENT,
    backgroundColor: LightStatusColors.SENT,
    darkerBackground: MediumStatusColors.SENT,
    strippedBackground: true,
    statusIcon: "phoneSent",
    statusLabel: "scheduler.legend.sentToTrucker",
};

// Given a segment in the schedule for carrier, When the segment is acknowledged by the trucker,
export const acknowledged: Decoration = {
    color: StatusColors.ACKNOWLEDGED,
    backgroundColor: LightStatusColors.ACKNOWLEDGED,
    darkerBackground: MediumStatusColors.ACKNOWLEDGED,
    statusIcon: "phoneReceived",
    statusLabel: "components.receivedByTrucker",
};

export const onGoing: Decoration = {
    color: StatusColors.ON_GOING,
    backgroundColor: LightStatusColors.ON_GOING,
    darkerBackground: MediumStatusColors.ON_GOING,
    statusIcon: "truck",
    statusLabel: "components.ongoing",
};

// Given a segment in the schedule for carrier, When the trucker is on loading site,
export const onLoadingSite: Decoration = {
    ...onGoing,
    statusLabel: "common.onPickupSite",
};

// Given a segment in the schedule for carrier, When the trucker is done loading,
export const loadingComplete: Decoration = {
    ...onGoing,
    statusLabel: "scheduler.loadingComplete",
};

// Given a segment in the schedule for carrier, When the trucker is on unloading site,
export const onUnloadingSite: Decoration = {
    ...onGoing,
    statusLabel: "common.onDeliverySite",
};

// Given a segment in the schedule for carrier, When the trucker is done unloading,
export const unloadingComplete: Decoration = {
    color: StatusColors.DONE,
    backgroundColor: LightStatusColors.DONE,
    darkerBackground: MediumStatusColors.DONE,
    statusIcon: "check",
    statusIconStrokeWidth: 3,
    statusLabel: "scheduler.done",
};

// Given a segment in the schedule for carrier, when the transport status is done
export const done: Decoration = {
    ...unloadingComplete,
};

export const verified: Decoration = {
    color: StatusColors.VERIFIED,
    backgroundColor: LightStatusColors.VERIFIED,
    darkerBackground: MediumStatusColors.VERIFIED,
    strippedBackground: true,
    statusIcon: "doubleCheck",
    statusIconStrokeWidth: 2.5,
    statusLabel: "components.verified",
};
// Given a segment in the schedule for carrier, When the segment has been invoiced,
export const invoiced: Decoration = {
    color: StatusColors.INVOICED,
    backgroundColor: LightStatusColors.INVOICED,
    darkerBackground: MediumStatusColors.INVOICED,
    statusIcon: "euro",
    statusLabel: "scheduler.invoiced",
};

export const declined: Decoration = {
    color: StatusColors.CANCELLED,
    backgroundColor: LightStatusColors.CANCELLED,
    darkerBackground: MediumStatusColors.CANCELLED,
    strippedBackground: true,
    statusIcon: "cancel",
    statusLabel: "scheduler.legend.declinedByCharter",
};

export const sent_to_charter: Decoration = {
    statusIcon: "send",
    color: StatusColors.SENT,
    backgroundColor: LightStatusColors.SENT,
    darkerBackground: MediumStatusColors.SENT,
    strippedBackground: true,
    statusLabel: "scheduler.legend.sentToCharter",
};

export const accepted_by_charter: Decoration = {
    color: StatusColors.SENT,
    backgroundColor: LightStatusColors.SENT,
    darkerBackground: MediumStatusColors.SENT,
    statusIcon: "check",
    statusIconStrokeWidth: 3,
    statusLabel: "scheduler.legend.acceptedByCharter",
};

export const assigned: Decoration = {
    color: StatusColors.PLANNED,
    backgroundColor: LightStatusColors.PLANNED,
    darkerBackground: MediumStatusColors.PLANNED,
    statusIcon: "truck",
    statusLabel: "siteStatusBadgde.planned",
};

export const cancelled: Decoration = {
    statusIcon: "cancel",
    color: StatusColors.CANCELLED,
    backgroundColor: LightStatusColors.CANCELLED,
    darkerBackground: MediumStatusColors.CANCELLED,
    statusLabel: "components.cancelled",
};

export const siteTypeIcons: {[key: string]: IconNames} = {
    trip_start: "arrowRightFull",
    trip_end: "arrowLeftFull",
    loading: "schedulerUpArrow",
    unloading: "schedulerDownArrow",
    breaking: "houseSimple",
    resuming: "houseSimple",
    breakingResuming: "houseSimple",
};

export const siteTypeLabels: {[key: string]: TranslationKeys} = {
    loading: "common.pickup",
    unloading: "common.delivery",
    breakingResuming: "common.siteType.breakingResuming",
    trip_start: "trip.tripStart",
    trip_end: "trip.tripEnd",
};
