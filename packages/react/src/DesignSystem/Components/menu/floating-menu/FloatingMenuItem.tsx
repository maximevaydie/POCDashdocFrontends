import {useFloatingTree, useListItem, useMergeRefs} from "@floating-ui/react";
import React from "react";

import {ButtonProps} from "../../../Elements/button";
import {ClickableFlex} from "../../../Elements/layout";
import {themeAwareCss} from "../../../utils";
import {BasicMenuItem, BasicMenuItemProps} from "../BasicMenuItem";

import {MenuContext} from "./FloatingMenu";

type FloatingMenuItemProps = BasicMenuItemProps & {
    keyLabel: string;
    keepOpenOnClick?: boolean;
} & React.ButtonHTMLAttributes<HTMLDivElement>;
export const FloatingMenuItem = React.forwardRef<
    HTMLDivElement & ButtonProps,
    FloatingMenuItemProps
>(
    (
        {keyLabel, label, icon, severity, isLink, iconColor, keepOpenOnClick = false, ...props},
        forwardedRef
    ) => {
        const menu = React.useContext(MenuContext);
        const item = useListItem({label: keyLabel});
        const tree = useFloatingTree();
        const isActive = item.index === menu.activeIndex;

        return (
            <ClickableFlex
                {...props}
                ref={useMergeRefs([item.ref, forwardedRef])}
                role="menuitem"
                tabIndex={isActive ? 0 : -1}
                {...menu.getItemProps({
                    onClick(event: React.MouseEvent<HTMLDivElement>) {
                        props.onClick?.(event);
                        if (!keepOpenOnClick) {
                            tree?.events.emit("click");
                        }
                    },
                    onFocus(event: React.FocusEvent<HTMLDivElement>) {
                        props.onFocus?.(event);
                        menu.setHasFocusInside(true);
                    },
                })}
                py={2}
                px={4}
                css={themeAwareCss({
                    "&:focus-visible": {backgroundColor: "grey.light", outline: "none"},
                })}
            >
                <BasicMenuItem
                    label={label}
                    icon={icon}
                    severity={severity}
                    isLink={isLink}
                    iconColor={iconColor}
                />
            </ClickableFlex>
        );
    }
);
FloatingMenuItem.displayName = "FloatingMenuItem";
