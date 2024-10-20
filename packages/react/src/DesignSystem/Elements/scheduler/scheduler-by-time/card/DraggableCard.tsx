import {DraggableBox} from "@dashdoc/web-ui";
import React, {CSSProperties, Fragment, ReactNode, useContext, useMemo} from "react";

import {DndSchedulerPayload} from "../../scheduler.types";
import {SchedulerDndContext} from "../../SchedulerDndContext";

type Props = {
    itemUid: string;
    resourceUid: string;
    startDate: Date;
    draggable: boolean;
    children: ReactNode;
};

export const DraggableCard = React.memo(function DraggableCard({
    itemUid,
    resourceUid,
    startDate,
    draggable,
    children,
}: Props) {
    const sourcePayload: DndSchedulerPayload = useMemo(
        () => ({
            resourceUid,
            day: startDate.toISOString(),
            index: 0,
        }),
        [resourceUid, startDate]
    );
    const {kind, useDraggedEntityByUid, draggableType} = useContext(SchedulerDndContext);

    const defaultEntity = useMemo(() => ({itemUid}), [itemUid]);
    const entity = useDraggedEntityByUid?.(itemUid) ?? defaultEntity;

    return (
        <Fragment key={`card-${itemUid}`}>
            <DraggableWrapper
                key={`draggable-${resourceUid}-${startDate.toISOString()}-${itemUid}`}
                kind={kind}
                payload={sourcePayload}
                entity={entity}
                id={itemUid}
                type={draggableType}
                disabled={!draggable}
                styleProvider={styleProvider}
            >
                {children}
            </DraggableWrapper>
        </Fragment>
    );

    function styleProvider(
        isDraggingItem: boolean,
        isDraggingAny: boolean,
        delayedIsDraggingItem: boolean,
        draggingItemId: string | null
    ) {
        return {
            opacity: draggingItemId == itemUid || isDraggingItem ? 0.4 : 1,
            position: "relative",
            zIndex: isDraggingAny && (!isDraggingItem || delayedIsDraggingItem) ? 0 : 1,
        } as CSSProperties;
    }
});

const DraggableWrapper = React.memo(DraggableBox);
