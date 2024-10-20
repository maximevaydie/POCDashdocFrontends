import {useToggle} from "dashdoc-utils";
import React, {
    ElementType,
    FunctionComponent,
    ReactNode,
    useEffect,
    useRef,
    useState,
} from "react";

import {Box, BoxProps} from "./Box";

type ResizeDirection = "left" | "right" | "top" | "bottom";

export type ResizableBoxProps = BoxProps & {
    onResizeDone?: (width: string, height: string) => void;
    asComponent?: ElementType;
    minSize?: {width?: string; height?: string};
    disabled?: boolean;
    resizingBoxProps?: BoxProps;
    step?: {x?: number; y?: number};
    stepOffset?: {x?: number; y?: number};
    getResizingIndicator?: ({
        width,
        height,
    }: {
        width?: number | string;
        height?: number | string;
    }) => ReactNode;
    showResizeHandleOnHover?: boolean;
    resizeHandleColor?: string;
    scrollableContainerId?: string;
    allowedDirections: ResizeDirection[];
};

export const ResizableBox: FunctionComponent<ResizableBoxProps> = ({
    children,
    onResizeDone,
    asComponent,
    minSize,
    disabled,
    resizingBoxProps,
    step,
    stepOffset,
    getResizingIndicator,
    scrollableContainerId,
    allowedDirections = ["right"],
    showResizeHandleOnHover,
    resizeHandleColor = "blue.default",
    ...boxProps
}) => {
    const resizeBoxRef = useRef<HTMLDivElement | null>(null);
    const previousScrollOffset = useRef({x: 0, y: 0});
    const [isResizing, startResizing, stopResizing] = useToggle(false);
    const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);
    const [dimensions, setDimensions] = useState<{
        width?: number | string;
        height?: number | string;
    }>({});
    const [isHoveringResizeHandle, setIsHoveringResizeHandle] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mouseup", endResize);
            window.addEventListener("mousemove", handleResize);
        }

        return () => {
            window.removeEventListener("mouseup", endResize);
            window.removeEventListener("mousemove", handleResize);
        };
    }, [isResizing]);

    const handleResize = (event: MouseEvent) => {
        if (isResizing && resizeDirection) {
            document.body.style.cursor = getCursorStyle(resizeDirection);
            const panel = resizeBoxRef.current;
            if (panel) {
                const {width, height} = panel.getBoundingClientRect();
                let newWidth: number | string = "100%";
                let newHeight: number | string = "100%";

                const scrollOffset = getScrollOffset();
                const scrollDeltaX = scrollOffset.x - previousScrollOffset.current.x;
                const scrollDeltaY = scrollOffset.y - previousScrollOffset.current.y;
                previousScrollOffset.current = scrollOffset;

                if (resizeDirection.includes("right")) {
                    newWidth = Math.max(
                        width + event.movementX + scrollDeltaX,
                        parseFloat(minSize?.width || "0")
                    );
                } else if (resizeDirection.includes("left")) {
                    const deltaWidth = event.movementX + scrollDeltaX;
                    newWidth = Math.max(width - deltaWidth, parseFloat(minSize?.width || "0"));
                    if (newWidth !== width) {
                        panel.style.width = `${newWidth}px`;
                        panel.style.left = `${panel.offsetLeft + (width - newWidth)}px`;
                    }
                }

                if (resizeDirection.includes("bottom")) {
                    newHeight = Math.max(
                        height + event.movementY + scrollDeltaY,
                        parseFloat(minSize?.height || "0")
                    );
                } else if (resizeDirection.includes("top")) {
                    const deltaHeight = event.movementY + scrollDeltaY;
                    newHeight = Math.max(height - deltaHeight, parseFloat(minSize?.height || "0"));
                    if (newHeight !== height) {
                        panel.style.height = `${newHeight}px`;
                        panel.style.top = `${panel.offsetTop + (height - newHeight)}px`;
                    }
                }

                if (!resizeDirection.includes("left")) {
                    panel.style.width = `${newWidth}px`;
                }
                if (!resizeDirection.includes("top")) {
                    panel.style.height = `${newHeight}px`;
                }

                setDimensions({
                    width:
                        step?.x && typeof newWidth === "number"
                            ? getValueByStep(newWidth, step.x, stepOffset?.x)
                            : newWidth,
                    height:
                        step?.y && typeof newHeight === "number"
                            ? getValueByStep(newHeight, step.y, stepOffset?.y)
                            : newHeight,
                });
            }
        }
    };

    const endResize = () => {
        stopResizing();
        setResizeDirection(null);
        document.body.style.cursor = "";
        const panel = resizeBoxRef.current;
        if (panel) {
            let {width, height} = panel.getBoundingClientRect();
            if (step?.x) {
                width = getValueByStep(width, step.x, stepOffset?.x);
            }
            if (step?.y) {
                height = getValueByStep(height, step.y, stepOffset?.y);
            }
            onResizeDone?.(`${width}px`, `${height}px`);
        }
    };

    const renderResizeHandle = (direction: ResizeDirection) => {
        if (!allowedDirections.includes(direction)) {
            return null;
        }

        const position: Partial<Record<"top" | "right" | "bottom" | "left", number>> = {};
        let cursor = "default";
        let width = "100%";
        let height = "100%";

        if (direction.includes("top")) {
            position.top = 0;
            height = "2px";
        }
        if (direction.includes("right")) {
            position.top = 0;
            position.right = 0;
            width = "2px";
        }
        if (direction.includes("bottom")) {
            position.bottom = 0;
            height = "2px";
        }
        if (direction.includes("left")) {
            position.top = 0;
            position.left = 0;
            width = "2px";
        }

        cursor = getCursorStyle(direction);

        return (
            <Box
                onMouseEnter={() => setIsHoveringResizeHandle(true)}
                onMouseLeave={() => setIsHoveringResizeHandle(false)}
                backgroundColor={
                    (showResizeHandleOnHover && isHovering) || isHoveringResizeHandle || isResizing
                        ? resizeHandleColor
                        : "transparent"
                }
                key={direction}
                position="absolute"
                width={width}
                height={height}
                zIndex="level3"
                style={{cursor}}
                {...position}
                onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    previousScrollOffset.current = getScrollOffset();
                    startResizing();
                    setResizeDirection(direction);
                }}
            />
        );
    };

    const renderResizingIndicator = () => {
        if (!getResizingIndicator) {
            return null;
        }

        const indicatorStyle: React.CSSProperties = {
            position: "absolute",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "level4",
            backgroundColor: "grey.white",
        };

        switch (resizeDirection) {
            case "left":
                return (
                    <Box style={{...indicatorStyle, right: "100%", top: 0}}>
                        {getResizingIndicator?.({
                            width: dimensions.width,
                            height: dimensions.height,
                        })}
                    </Box>
                );
            case "right":
            case "top":
                return (
                    <Box style={{...indicatorStyle, left: "100%", top: 0}}>
                        {getResizingIndicator?.({
                            width: dimensions.width,
                            height: dimensions.height,
                        })}
                    </Box>
                );
            case "bottom":
                return (
                    <Box style={{...indicatorStyle, top: "100%", right: 0}}>
                        {getResizingIndicator?.({
                            width: dimensions.width,
                            height: dimensions.height,
                        })}
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Box
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            ref={resizeBoxRef}
            as={asComponent}
            {...boxProps}
            {...(isResizing ? resizingBoxProps : {})}
        >
            <Box position="relative" height="100%">
                {children}

                {!disabled && allowedDirections.map((direction) => renderResizeHandle(direction))}
                {isResizing && renderResizingIndicator()}
            </Box>
        </Box>
    );

    function getCursorStyle(direction: ResizeDirection) {
        return direction === "left" || direction === "right" ? "ew-resize" : "ns-resize";
    }

    function getScrollOffset() {
        if (scrollableContainerId) {
            const container = document.getElementById(scrollableContainerId);
            return {
                x: container?.scrollLeft ?? 0,
                y: container?.scrollTop ?? 0,
            };
        }
        return {x: 0, y: 0};
    }
};

function getValueByStep(value: number, step: number, offset = 0) {
    return offset + Math.round((value - offset) / step) * step;
}
