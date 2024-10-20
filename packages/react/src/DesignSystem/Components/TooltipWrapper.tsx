import {Box, BoxProps, Text, theme, useDevice} from "@dashdoc/web-ui";
import {
    FloatingArrow,
    FloatingPortal,
    Placement,
    arrow,
    autoUpdate,
    flip,
    offset,
    safePolygon,
    shift,
    useDismiss,
    useFloating,
    useHover,
    useInteractions,
} from "@floating-ui/react";
import React, {useRef, useState} from "react";

const ARROW_HEIGHT = 7;
const GAP = 2;

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export type Props = {
    children: React.ReactNode;
    content: React.ReactNode;
    boxProps?: BoxProps & {className?: string};
    delayShow?: number;
    delayHide?: number;
    hideOnPress?: boolean;
    hidden?: boolean;
    forceDisplay?: boolean;
    onlyOnDesktop?: boolean;
    placement?: TooltipPlacement;
    gap?: number;
};

export const TooltipWrapper: React.FunctionComponent<Props> = ({
    children,
    content,
    boxProps,
    delayShow = 200,
    delayHide,
    hideOnPress,
    hidden,
    forceDisplay,
    onlyOnDesktop,
    placement = "top",
    gap = GAP,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const arrowRef = useRef(null);
    const device = useDevice();
    const tooltipColor = "white";
    const tooltipBorderColor = "lightgrey";

    let fallbackPlacements: Placement[];
    if (placement === "top") {
        fallbackPlacements = ["bottom", "left", "right"];
    } else if (placement === "bottom") {
        fallbackPlacements = ["top", "left", "right"];
    } else if (placement === "left") {
        fallbackPlacements = ["right", "top", "bottom"];
    } else {
        fallbackPlacements = ["left", "top", "bottom"];
    }

    /**
     * Wrap the content in a Text when the type is string to get the expected styling
     * @see https://linear.app/dashdoc/issue/BUG-3416/flow-on-workload-smoothing-tooltip-text-is-not-displayed-in-full
     */
    const contentJsx = typeof content === "string" ? <Text>{content}</Text> : content;

    const {x, y, strategy, refs, context} = useFloating({
        open: forceDisplay || isOpen,
        // onOpenChange: (_) => setIsOpen(true),
        onOpenChange: setIsOpen,
        whileElementsMounted: autoUpdate,
        placement,
        middleware: [
            offset(ARROW_HEIGHT + gap),
            shift(),
            // `flip` use the first placement where the tooltip fit, it is more predictable than `auto`
            // With these settings, the other axis is used only if the tooltip doesn't fit on the first axis
            flip({fallbackPlacements}),
            arrow({
                element: arrowRef,
            }),
        ],
    });
    const hover = useHover(context, {
        delay: {
            open: delayShow,
            close: delayHide,
        },
        // Prevents closing when hovering in the gap between the reference and the floating element
        handleClose: safePolygon(),
    });
    const interactions = [hover];
    const dismiss = useDismiss(context, {referencePress: true});

    if (hideOnPress) {
        interactions.push(dismiss);
    }

    const {getReferenceProps, getFloatingProps} = useInteractions(interactions);
    const disabled = onlyOnDesktop && device === "mobile";
    return (
        <>
            <Box ref={refs.setReference} {...getReferenceProps()} {...boxProps}>
                {children}
            </Box>
            {!hidden && !!content && !disabled && (
                <FloatingPortal id="react-app">
                    {(forceDisplay || isOpen) && (
                        <div
                            ref={refs.setFloating}
                            style={{
                                position: strategy,
                                top: y ?? 0,
                                left: x ?? 0,
                                width: "max-content",
                                backgroundColor: tooltipColor,
                                border: "1px solid",
                                borderColor: tooltipBorderColor,
                                padding: 10,
                                zIndex: theme.zIndices.tooltip,
                            }}
                            {...getFloatingProps()}
                        >
                            <FloatingArrow
                                ref={arrowRef}
                                context={context}
                                fill={tooltipColor}
                                stroke={tooltipBorderColor}
                                strokeWidth={1}
                            />
                            <Box maxHeight="calc(100vh - 20px)" overflowY={"auto"}>
                                {contentJsx}
                            </Box>
                        </div>
                    )}
                </FloatingPortal>
            )}
        </>
    );
};
