export const DND_DEBUGGER = false;

export type DndContext = {
    kind: string;
    payload: object;
    id: string;
};

export type DropEvent = {
    entity: object;
    source: DndContext;
    target: DndContext & {position?: {x: number; y: number} | null};
};

export type DndItem = {
    entity: object;
    context: DndContext;
};
