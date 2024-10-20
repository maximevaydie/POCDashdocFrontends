import React from "react";
import {Item, ItemProps} from "react-contexify";
import "react-contexify/ReactContexify.css";

import {BasicMenuItem, BasicMenuItemProps} from "../BasicMenuItem";

export type ContextMenuItemProps = Omit<ItemProps, "children"> & BasicMenuItemProps;

export const ContextMenuItem = ({
    label,
    icon,
    severity,
    isLink,
    ...props
}: ContextMenuItemProps) => {
    return (
        <Item {...props}>
            <BasicMenuItem label={label} icon={icon} severity={severity} isLink={isLink} />
        </Item>
    );
};
