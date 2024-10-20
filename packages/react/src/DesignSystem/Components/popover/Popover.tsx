import {
    FlipOptions,
    FloatingFocusManager,
    FloatingPortal,
    Placement,
    autoUpdate,
    flip,
    offset,
    shift,
    size,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useMergeRefs,
    useRole,
} from "@floating-ui/react";
import React, {forwardRef, useMemo, useState} from "react";
import {flushSync} from "react-dom";

import {IconButton} from "../../button";
import {Card, Flex, CardProps} from "../../layout";
import {Box, BoxProps} from "../../layout/Box";
import {Text} from "../Text";

export type PopoverOptions = {
    placement?: Placement;
    visibility?: {
        isOpen: boolean;
        onOpenChange: (value: boolean) => void;
    };
    fallbackAxisSideDirection?: FlipOptions["fallbackAxisSideDirection"];
    onClose?: () => void;
};
type Props = PopoverOptions & {
    children: React.ReactNode;
};

export const Popover = ({children, ...popoverOptions}: Props) => {
    const popover = usePopover(popoverOptions);
    return <PopoverContext.Provider value={popover}>{children}</PopoverContext.Provider>;
};

const Trigger = forwardRef<HTMLDivElement, {children: React.ReactNode} & BoxProps>(
    function PopoverTrigger({children, ...boxProps}, propRef) {
        const context = usePopoverContext();
        const ref = useMergeRefs<HTMLDivElement>([context.refs.setReference, propRef]);

        return (
            <Box ref={ref} {...boxProps} {...context.getReferenceProps()}>
                {children}
            </Box>
        );
    }
);
Popover.Trigger = Trigger;

function Content({
    children,
    rootId = "react-app",
    ...cardProps
}: {
    rootId?: string;
    children: React.ReactNode;
} & CardProps) {
    const {context: floatingContext, maxHeight, ...context} = usePopoverContext();
    const ref = useMergeRefs([context.refs.setFloating]);

    if (!floatingContext.open) {
        return null;
    }

    return (
        <FloatingPortal root={document.getElementById(rootId)}>
            <FloatingFocusManager context={floatingContext} initialFocus={context.refs.floating}>
                <Card
                    borderRadius={1}
                    border="1px solid"
                    borderColor="grey.light"
                    boxShadow="small"
                    ref={ref}
                    style={context.floatingStyles}
                    maxHeight={maxHeight}
                    overflow={"auto"}
                    zIndex="modal"
                    p={2}
                    {...context.getFloatingProps()}
                    {...cardProps}
                >
                    {children}
                </Card>
            </FloatingFocusManager>
        </FloatingPortal>
    );
}
Popover.Content = Content;
function Header({title}: {title: string} & CardProps) {
    const {setOpen} = usePopoverContext();
    return (
        <Flex
            py={1}
            px={2}
            mx={-2}
            mt={-2}
            mb={2}
            borderBottom={"1px solid"}
            borderBottomColor="grey.light"
            justifyContent="space-between"
            alignItems="center"
        >
            <Box>
                <Text variant="h1">{title}</Text>
            </Box>

            <IconButton
                data-testid="close-popover"
                name="close"
                onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setOpen(false);
                }}
            />
        </Flex>
    );
}
Popover.Header = Header;

function usePopover({
    placement = "bottom",
    visibility,
    fallbackAxisSideDirection,
    onClose,
}: PopoverOptions = {}) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

    const open = visibility ? visibility.isOpen : uncontrolledOpen;
    const setOpen = visibility ? visibility.onOpenChange : setUncontrolledOpen;

    function setOpenChange(value: boolean) {
        setOpen(value);
        if (!value) {
            onClose?.();
        }
    }
    const [maxHeight, setMaxHeight] = useState<number | null>(null);

    const data = useFloating({
        placement,
        open,
        onOpenChange: setOpenChange,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(5),
            flip({
                fallbackAxisSideDirection,
            }),
            shift({padding: 5}),
            size({
                apply({availableHeight}: {availableHeight: number}) {
                    flushSync(() => setMaxHeight(availableHeight));
                },
            }),
        ],
    });

    const context = data.context;

    const click = useClick(context);
    const dismiss = useDismiss(context);
    const role = useRole(context);

    const interactions = useInteractions([click, dismiss, role]);

    return useMemo(
        () => ({
            open,
            setOpen,
            maxHeight,
            ...interactions,
            ...data,
        }),
        [open, setOpen, interactions, data, maxHeight]
    );
}

type ContextType = ReturnType<typeof usePopover> | null;

const PopoverContext = React.createContext<ContextType>(null);

const usePopoverContext = () => {
    const context = React.useContext(PopoverContext);

    if (context == null) {
        throw new Error("Popover components must be wrapped in <Popover />");
    }

    return context;
};
