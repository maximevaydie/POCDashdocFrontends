import {createContext} from "react";

import {DndData} from "./scheduler.types";

export const SchedulerDndContext = createContext<DndData>({
    onDrop: () => {},
    kind: "scheduler",
    acceptedTypes: [],
    isDroppable: () => true,
    ghostCards: {},
    draggableType: "planned",
});
