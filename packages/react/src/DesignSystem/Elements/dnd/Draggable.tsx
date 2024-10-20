import {Box} from "@dashdoc/web-ui";
import React, {CSSProperties, ReactNode, useEffect, useState} from "react";
import {useDrag, useDragDropManager} from "react-dnd";
import {getEmptyImage} from "react-dnd-html5-backend";

import {Tr} from "../base/table/Row";

import {DndContext, DndItem} from "./types";

type DraggableBoxProps = {
    children: ReactNode;
    type?: string;
    entity: object;
    disabled?: boolean;
    styleProvider?: (
        isDraggingItem: boolean,
        isDraggingAny: boolean,
        delayedIsDraggingItem: boolean,
        draggingItemId: string | null
    ) => CSSProperties;
} & DndContext;

export const DraggableBox = ({
    children,
    kind,
    type = "*",
    entity,
    payload,
    id,
    disabled,
    styleProvider = () => ({}),
}: DraggableBoxProps) => {
    const context: DndContext = {kind, payload, id};
    const item: DndItem = {entity, context};

    const [{isDraggingItem}, ref, dragPreview] = useDrag(() => ({
        type,
        collect: (monitor) => ({
            isDraggingItem: monitor.isDragging(),
        }),
        canDrag: () => !disabled,
        item,
    }));
    const dragDropManager = useDragDropManager();
    const isDraggingAny = dragDropManager.getMonitor().isDragging();
    const draggingItemId = dragDropManager.getMonitor().getItem()?.context?.id;

    /**
     * The browser APIs provide no way to change the drag preview or its behavior once drag has started.
     * Libraries such as jQuery UI implement the drag and drop from scratch to work around this,
     * but react-dnd only supports browser drag and drop “backend” for now, so we have to accept its limitations.
     * We can, however, customize behavior a great deal if we feed the browser an empty image as drag preview.
     * @see https://react-dnd.github.io/react-dnd/examples/drag-around/custom-drag-layer
     */
    useEffect(() => {
        dragPreview(getEmptyImage(), {captureDraggingState: true});
    }, [dragPreview]);

    /**
     * Tweak to be able to update style without blocking drag start (eg: change zIndex, or display none)
     * Without this timeout, it fires dragend right after dragstart if source element is not accessible anymore
     */
    const [delayedIsDraggingItem, setDelayedIsDraggingItem] = useState(false);
    useEffect(() => {
        if (isDraggingItem) {
            setTimeout(() => {
                setDelayedIsDraggingItem(true);
            }, 0);
        } else {
            setDelayedIsDraggingItem(false);
        }
    }, [isDraggingItem]);

    return (
        <Box
            ref={ref}
            onClick={handleClick}
            style={{
                opacity: isDraggingItem ? 0.4 : 1,
                ...styleProvider(
                    isDraggingItem,
                    isDraggingAny,
                    delayedIsDraggingItem,
                    draggingItemId
                ),
            }}
        >
            <Box
                style={
                    /* disable the popover behavior when is dragging one element */ {
                        pointerEvents: isDraggingAny ? "none" : "visible",
                    }
                }
            >
                {children}
            </Box>
        </Box>
    );

    function handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (isDraggingItem) {
            e.stopPropagation();
        }
    }
};

type DraggableTrProps = {
    children: ReactNode;
    type?: string;
    rowProps: {
        isClickable: boolean;
        isSelected: boolean;
        isEditing: boolean;
        "data-testid": string;
    };
    index: number;
    entity: object;
} & DndContext;

export const DraggableTr = ({
    children,
    kind,
    type = "*",
    entity,
    payload,
    id,
    rowProps,
    index,
}: DraggableTrProps) => {
    const context: DndContext = {kind, payload, id};
    const item: DndItem = {entity, context};

    const [{isDragging}, ref, dragPreview] = useDrag(() => ({
        type,
        collect: (monitor) => {
            return {
                isDragging: monitor.isDragging(),
            };
        },
        item,
    }));

    /**
     * The browser APIs provide no way to change the drag preview or its behavior once drag has started.
     * Libraries such as jQuery UI implement the drag and drop from scratch to work around this,
     * but react-dnd only supports browser drag and drop “backend” for now, so we have to accept its limitations.
     * We can, however, customize behavior a great deal if we feed the browser an empty image as drag preview.
     * @see https://react-dnd.github.io/react-dnd/examples/drag-around/custom-drag-layer
     */
    useEffect(() => {
        dragPreview(getEmptyImage(), {captureDraggingState: true});
    }, [dragPreview]);

    return (
        <Tr
            {...rowProps}
            data-test-row-id={id}
            index={index}
            ref={ref}
            style={{opacity: isDragging ? 0.4 : 1}}
        >
            {children}
        </Tr>
    );
};
