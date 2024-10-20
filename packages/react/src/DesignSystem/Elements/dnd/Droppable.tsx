import {Box, BoxProps} from "@dashdoc/web-ui";
import React, {CSSProperties, ReactNode, useRef, useState} from "react";
import {useDrop} from "react-dnd";

import {DropEvent, DndContext, DND_DEBUGGER, DndItem} from "./types";

type Props = {
    children?: ReactNode;
    whenDrag?: ReactNode | ((entity: object | undefined) => ReactNode); // be careful: when a file is dragged on the page, we get an item with no entity, and the whenDrag function must deal with it (see BUG-3293)
    whenDragOver?: ReactNode | ((position: {x: number; y: number} | null) => ReactNode);
    acceptedType?: string | string[];
    // We cant trust the data type, so we use unknown. You are responsible for checking the type.
    onDrop: (drop: DropEvent) => void;
    isDroppable?: (source: DndContext, target: DndContext) => boolean;
    computeDropPosition?: boolean;
    styleProvider?: (isDragging: boolean, isOver: boolean, canDrop: boolean) => CSSProperties;
} & DndContext &
    BoxProps;

export const Droppable = ({
    children,
    whenDrag,
    whenDragOver,
    kind,
    acceptedType = "*",
    onDrop,
    isDroppable,
    computeDropPosition,
    styleProvider = () => ({}),
    payload,
    id,
    ...boxProps
}: Props) => {
    const target: DndContext = {kind, payload, id};
    const boundingBox = useRef<DOMRect | null>(null);
    const [dragOverPosition, setDragOverPosition] = useState<{x: number; y: number} | null>(null);

    const [{isOver, isDragging, canDrop, entity}, dropRef] = useDrop(
        () => ({
            accept: acceptedType,
            drop: ({entity, context: source}: DndItem, monitor) => {
                const drop: DropEvent = {
                    entity,
                    source,
                    target,
                };
                if (computeDropPosition) {
                    const offset = monitor.getClientOffset();
                    const position =
                        offset && boundingBox.current
                            ? {
                                  x: offset.x - boundingBox.current.x,
                                  y: offset.y - boundingBox.current.y,
                              }
                            : null;
                    drop.target.position = position;
                }

                onDrop(drop);
            },
            hover: (_item, monitor) => {
                if (computeDropPosition) {
                    const offset = monitor.getClientOffset();
                    setDragOverPosition(
                        offset && boundingBox.current
                            ? {
                                  x: offset.x - boundingBox.current.x,
                                  y: offset.y - boundingBox.current.y,
                              }
                            : null
                    );
                }
            },
            canDrop: ({context: source}) => {
                return isDroppable ? isDroppable(source, target) : true;
            },
            collect: (monitor) => {
                const item = monitor.getItem();
                return {
                    isOver: !!monitor.isOver({shallow: true}),
                    isDragging: !!item,
                    canDrop: monitor.canDrop(),
                    entity: item?.entity,
                };
            },
        }),
        [onDrop, isDroppable]
    );

    function combinedRef(el: HTMLDivElement) {
        dropRef(el);
        if (el) {
            boundingBox.current = el.getBoundingClientRect();
        }
    }

    let style: CSSProperties = styleProvider(isDragging, isOver, canDrop);
    return (
        <>
            {children}
            <>
                {(isDragging || DND_DEBUGGER) && (
                    <>
                        {children ? (
                            <Box
                                height="100%"
                                position="relative"
                                display={canDrop ? "block" : DND_DEBUGGER ? "block" : "none"}
                            >
                                <Box
                                    ref={combinedRef}
                                    zIndex="level1"
                                    style={{
                                        position: "absolute",
                                        height: "100%",
                                        width: "100%",
                                        top: children ? "-100%" : undefined,
                                        ...style,
                                    }}
                                    {...boxProps}
                                >
                                    {isOver || DND_DEBUGGER
                                        ? (typeof whenDragOver === "function"
                                              ? whenDragOver(dragOverPosition)
                                              : whenDragOver) ??
                                          (typeof whenDrag === "function"
                                              ? whenDrag(entity)
                                              : whenDrag)
                                        : typeof whenDrag === "function"
                                          ? whenDrag(entity)
                                          : whenDrag}
                                </Box>
                            </Box>
                        ) : (
                            <Box
                                ref={combinedRef}
                                zIndex="level1"
                                style={{
                                    position: "absolute",
                                    height: "100%",
                                    width: "100%",
                                    ...style,
                                }}
                                {...boxProps}
                                display={canDrop ? "block" : DND_DEBUGGER ? "block" : "none"}
                            >
                                {isOver || DND_DEBUGGER
                                    ? (typeof whenDragOver === "function"
                                          ? whenDragOver(dragOverPosition)
                                          : whenDragOver) ??
                                      (typeof whenDrag === "function"
                                          ? whenDrag(entity)
                                          : whenDrag)
                                    : typeof whenDrag === "function"
                                      ? whenDrag(entity)
                                      : whenDrag}
                            </Box>
                        )}
                    </>
                )}
            </>
        </>
    );
};
