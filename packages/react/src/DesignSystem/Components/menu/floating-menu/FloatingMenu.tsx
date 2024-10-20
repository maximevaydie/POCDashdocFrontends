import {useDevice} from "@dashdoc/web-ui";
import {
    FloatingFocusManager,
    FloatingList,
    FloatingNode,
    FloatingPortal,
    FloatingTree,
    autoUpdate,
    flip,
    offset,
    safePolygon,
    shift,
    size,
    useClick,
    useDismiss,
    useFloating,
    useFloatingNodeId,
    useFloatingParentNodeId,
    useFloatingTree,
    useHover,
    useInteractions,
    useListItem,
    useListNavigation,
    useMergeRefs,
    useRole,
} from "@floating-ui/react";
import React, {ReactNode, forwardRef, useState} from "react";
import {flushSync} from "react-dom";

import {Button} from "../../../Elements/button";
import {Box, ClickableFlex, Flex} from "../../../Elements/layout";
import {themeAwareCss} from "../../../utils";
import {Icon, IconNames} from "../../icon";
import {Text} from "../../Text";
import {BasicMenuItem} from "../BasicMenuItem";

type FloatingMenuProps = Omit<React.HTMLProps<HTMLDivElement>, "label"> & {
    label?: ReactNode;
    icon?: IconNames;
    iconColor?: string;
    children?: React.ReactNode;
    openNestedMenuOnHover?: boolean;
    withSubMenuArrow?: boolean;
    dataTestId?: string;
};

export const FloatingMenu = forwardRef<HTMLDivElement, FloatingMenuProps>((props, ref) => {
    const parentId = useFloatingParentNodeId();

    if (parentId === null) {
        return (
            <FloatingTree>
                <MenuComponent {...props} ref={ref} />
            </FloatingTree>
        );
    }

    return <MenuComponent {...props} ref={ref} />;
});
FloatingMenu.displayName = "FloatingMenu";

const MenuComponent = forwardRef<HTMLDivElement, FloatingMenuProps>(
    ({children, label, icon, iconColor, dataTestId, withSubMenuArrow, ...props}, forwardedRef) => {
        const device = useDevice();
        const isMobile = device === "mobile";
        const {openNestedMenuOnHover = !isMobile} = props;
        const [isOpen, setIsOpen] = React.useState(false);
        const [hasFocusInside, setHasFocusInside] = React.useState(false);
        const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

        const elementsRef = React.useRef<Array<HTMLDivElement | null>>([]);
        const labelsRef = React.useRef<Array<string | null>>([]);
        const parent = React.useContext(MenuContext);

        const tree = useFloatingTree();
        const nodeId = useFloatingNodeId();
        const parentId = useFloatingParentNodeId();
        const item = useListItem();

        const isNested = parentId != null;
        const [maxHeight, setMaxHeight] = useState<number | null>(null);

        const {floatingStyles, refs, context} = useFloating<HTMLDivElement>({
            nodeId,
            open: isOpen,
            onOpenChange: setIsOpen,
            placement: isNested ? (isMobile ? "bottom" : "right-start") : "bottom-start",
            middleware: [
                offset({mainAxis: isNested ? 0 : 4, alignmentAxis: isNested ? -1 : 0}),
                ...(isNested ? [flip()] : []), // Conditionally include flip only for nested menus
                shift(),
                size({
                    apply({availableHeight}: {availableHeight: number}) {
                        flushSync(() => setMaxHeight(availableHeight));
                    },
                }),
            ],
            whileElementsMounted: autoUpdate,
        });

        const hover = useHover(context, {
            enabled: isNested && openNestedMenuOnHover,
            delay: {open: 100},
            handleClose: safePolygon({blockPointerEvents: true}),
        });
        const click = useClick(context, {
            event: "click",
            toggle: !isNested || !openNestedMenuOnHover,
            ignoreMouse: isNested && openNestedMenuOnHover,
        });
        const role = useRole(context, {role: "menu"});
        const dismiss = useDismiss(context, {bubbles: true});
        const listNavigation = useListNavigation(context, {
            enabled: !isNested,
            listRef: elementsRef,
            activeIndex,
            nested: isNested,
            onNavigate: setActiveIndex,
            focusItemOnHover: openNestedMenuOnHover,
        });

        const {getReferenceProps, getFloatingProps, getItemProps} = useInteractions([
            hover,
            click,
            role,
            dismiss,
            listNavigation,
        ]);

        // Event emitter allows you to communicate across tree components.
        // This effect closes all menus when an item gets clicked anywhere
        // in the tree.
        React.useEffect(() => {
            if (!tree) {
                return;
            }

            function handleTreeClick() {
                setIsOpen(false);
            }

            function onSubMenuOpen(event: {nodeId: string; parentId: string}) {
                if (event.nodeId !== nodeId && event.parentId === parentId) {
                    setIsOpen(false);
                }
            }

            tree.events.on("click", handleTreeClick);
            tree.events.on("menuopen", onSubMenuOpen);

            return () => {
                tree.events.off("click", handleTreeClick);
                tree.events.off("menuopen", onSubMenuOpen);
            };
        }, [tree, nodeId, parentId]);

        React.useEffect(() => {
            if (isOpen && tree) {
                tree.events.emit("menuopen", {parentId, nodeId});
            }
        }, [tree, isOpen, nodeId, parentId]);

        const menuRef = useMergeRefs([refs.setReference, item.ref, forwardedRef]) ?? undefined;
        const refProps = getReferenceProps(
            parent.getItemProps({
                ...props,
                onFocus(event: React.FocusEvent<HTMLDivElement>) {
                    props.onFocus?.(event);
                    setHasFocusInside(false);
                    parent.setHasFocusInside(true);
                },
            })
        );

        return (
            <FloatingNode id={nodeId}>
                {isNested ? (
                    <ClickableFlex
                        ref={menuRef}
                        tabIndex={parent.activeIndex === item.index ? 0 : -1}
                        role={"menuitem"}
                        data-open={isOpen ? "" : undefined}
                        data-nested={""}
                        data-focus-inside={hasFocusInside ? "" : undefined}
                        py={2}
                        px={4}
                        {...refProps}
                        alignItems="center"
                        justifyContent="space-between"
                        css={themeAwareCss({
                            backgroundColor: isOpen ? "grey.light" : undefined,
                            "&:focus-visible": {backgroundColor: "grey.light", outline: "none"},
                        })}
                        data-testid={dataTestId}
                    >
                        <BasicMenuItem
                            label={label}
                            icon={icon}
                            iconColor={iconColor}
                            withSubMenuArrow={withSubMenuArrow}
                        />
                    </ClickableFlex>
                ) : (
                    <Box
                        ref={menuRef}
                        data-open={isOpen ? "" : undefined}
                        data-focus-inside={hasFocusInside ? "" : undefined}
                        {...refProps}
                        data-testid={dataTestId}
                    >
                        {label && typeof label !== "string" ? (
                            <Flex style={{cursor: "pointer"}} alignItems="center">
                                {icon && <Icon name={icon} mr={2} color="grey.dark" />}
                                {label}
                            </Flex>
                        ) : (
                            <Button
                                variant="secondary"
                                width={1}
                                display="flex"
                                justifyContent="space-between"
                                paddingX={2}
                                height="100%"
                            >
                                {icon && <Icon name={icon} mr={label ? 1 : 0} />}
                                <Text variant="caption">{label}</Text>
                                <Icon
                                    name="arrowDown"
                                    color={isOpen ? "blue.dark" : undefined}
                                    ml={1}
                                    scale={0.5}
                                />
                            </Button>
                        )}
                    </Box>
                )}

                <MenuContext.Provider
                    value={{
                        activeIndex,
                        setActiveIndex,
                        getItemProps,
                        setHasFocusInside,
                        isOpen,
                    }}
                >
                    <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
                        {isOpen && (
                            <FloatingPortal id="react-floating-menu">
                                <FloatingFocusManager
                                    context={context}
                                    modal={false}
                                    initialFocus={isNested ? -1 : 0}
                                    returnFocus={!isNested}
                                >
                                    <Box
                                        ref={refs.setFloating}
                                        backgroundColor="grey.white"
                                        zIndex="insideModal"
                                        boxShadow="medium"
                                        border="1px solid"
                                        borderColor="grey.light"
                                        style={{...floatingStyles, outline: "none"}}
                                        maxHeight={maxHeight}
                                        overflowY={"auto"}
                                        {...getFloatingProps()}
                                    >
                                        {children}
                                    </Box>
                                </FloatingFocusManager>
                            </FloatingPortal>
                        )}
                    </FloatingList>
                </MenuContext.Provider>
            </FloatingNode>
        );
    }
);
MenuComponent.displayName = "MenuComponent";

export const MenuContext = React.createContext<{
    getItemProps: (userProps?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
    activeIndex: number | null;
    setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>;
    setHasFocusInside: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: boolean;
}>({
    getItemProps: () => ({}),
    activeIndex: null,
    setActiveIndex: () => {},
    setHasFocusInside: () => {},
    isOpen: false,
});
