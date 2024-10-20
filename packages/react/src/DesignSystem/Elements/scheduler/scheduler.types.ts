import {GhostComponentProps, DndContext, DropEvent} from "@dashdoc/web-ui";
import {FunctionComponent, ReactNode} from "react";

export type SchedulerResource = {
    uid: string;
    label: ReactNode;
};
export type SchedulerCard = {
    itemUid: string;
    type: string;
    startDate: Date;
    endDate: Date;
    resourceUid: string;
    sortOrder: number;
    height: number; // in px according the display of the card
    draggable: boolean;
    resizable?: boolean;
    ignoreForOrdering?: boolean;
    defaultSort?: string;
};

export type DndSchedulerPayload = {
    resourceUid: string;
    day: string | null;
    index: number;
};

export type DndData = {
    onDrop: (drop: DropEvent) => void;
    useDraggedEntityByUid?: (itemUid: string) => object | null;
    kind: string;
    acceptedTypes: string | string[];
    isDroppable: (source: DndContext, target: DndContext) => boolean;
    ghostCards: Record<string, FunctionComponent<GhostComponentProps>>;
    draggableType: string;
};
