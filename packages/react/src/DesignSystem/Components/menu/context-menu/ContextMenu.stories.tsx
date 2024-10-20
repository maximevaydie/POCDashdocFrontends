import {
    Box,
    Button,
    ContextMenu as ContextMenuComponent,
    ContextMenuItem,
    Text,
    useContextMenu,
} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import {MenuSeparator} from "base/menu/MenuSeparator";
import React, {MouseEvent} from "react";

export default {
    title: "Web UI/base/Menu/Context menu/ContextMenu",
    component: ContextMenuComponent,
    args: {
        id: "CONTEXT_MENU_ID",
    },
} as Meta;

const Template: Story<{id: string}> = (args) => {
    const {id} = args;
    const {show} = useContextMenu();
    return (
        <Box>
            <Button onContextMenu={(e: MouseEvent) => show({event: e, id: id})}>
                Right click to open menu
            </Button>

            <ContextMenuComponent id={id}>
                <ContextMenuItem
                    onClick={() => alert("menu item 1 link clicked")}
                    icon="eye"
                    label={"menu item 1"}
                    isLink
                />
                <ContextMenuItem
                    onClick={() => alert("menu item 2 clicked")}
                    icon="add"
                    label={"menu item 2"}
                />
                <MenuSeparator />
                <ContextMenuItem
                    onClick={() => alert("menu item 3 clicked")}
                    icon="delete"
                    label={"menu item 3"}
                    severity="danger"
                />
            </ContextMenuComponent>

            <Text mt={4}>
                <i>
                    See all available props on{" "}
                    <a
                        href="https://fkhadra.github.io/react-contexify/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        https://fkhadra.github.io/react-contexify/
                    </a>
                </i>
            </Text>
        </Box>
    );
};

export const ContextMenu = Template.bind({});
ContextMenu.storyName = "ContextMenu";
