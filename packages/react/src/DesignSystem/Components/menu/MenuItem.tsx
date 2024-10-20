import React, {MouseEventHandler} from "react";

import {ClickableFlex} from "../../Elements/layout/ClickableFlex";

import {BasicMenuItem, BasicMenuItemProps} from "./BasicMenuItem";

export type MenuItemProps = BasicMenuItemProps & {
    onClick?: MouseEventHandler<HTMLElement>;
    dataTestId?: string;
};
export const MenuItem = ({onClick, dataTestId, ...menuProps}: MenuItemProps) => {
    return (
        <ClickableFlex
            py={2}
            px={4}
            alignItems="center"
            justifyContent="space-between"
            data-testid={dataTestId}
            onClick={onClick}
        >
            <BasicMenuItem {...menuProps} />
        </ClickableFlex>
    );
};
