import {t} from "@dashdoc/web-core";
import {DndContext, DndSchedulerPayload} from "@dashdoc/web-ui";

import {CompactTrip} from "app/features/trip/trip.types";

/**
 * A scheduled card can't be moved when the trip is started or done
 * (excepted for reordering is the current cell).
 */
export function canMove(
    trip: CompactTrip,
    sourcePayload: DndSchedulerPayload,
    targetPayload: DndSchedulerPayload
): {result: true} | {result: false; message: string} {
    if (isMovedIntoSameCell(sourcePayload, targetPayload)) {
        return {result: true};
    }
    return canMoveToDifferentCell(trip);
}

function isMovedIntoSameCell(
    sourcePayload: DndSchedulerPayload,
    targetPayload: DndSchedulerPayload
) {
    return (
        sourcePayload.resourceUid === targetPayload.resourceUid &&
        sourcePayload.day === targetPayload.day
    );
}

function canMoveToDifferentCell(
    trip: CompactTrip
): {result: true} | {result: false; message: string} {
    // check trip status to verify if move is allowed or need confirmation
    if (trip.status === "done") {
        return {result: false, message: t("scheduler.moveTripDone")};
    }
    if (trip.status === "ongoing") {
        return {result: false, message: t("scheduler.moveTripOnGoing")};
    }
    return {result: true};
}

export function getPayload(context: DndContext): DndSchedulerPayload {
    let result: DndSchedulerPayload = {
        resourceUid: "unplanned",
        day: null,
        index: 0,
    };
    if (context.kind !== "table") {
        result = context.payload as DndSchedulerPayload;
    }
    return result;
}

export function isDroppable(source: DndContext, target: DndContext) {
    if (source.kind === "table" && target.kind === "table") {
        // Cant drop from table to table
        return false;
    }
    if (source.id === target.id) {
        // Cant drop on itself
        return false;
    }
    if (
        !["scheduler", "table"].includes(source.kind) ||
        !["scheduler", "table"].includes(target.kind)
    ) {
        // Dnd not handled here!
        return false;
    }
    const sourcePayload = source.payload as DndSchedulerPayload;
    const targetPayload = target.payload as DndSchedulerPayload;
    if (
        sourcePayload.day === targetPayload.day &&
        sourcePayload.resourceUid === targetPayload.resourceUid &&
        sourcePayload.index === targetPayload.index
    ) {
        // Cant drop on itself
        return false;
    }
    return true;
}
