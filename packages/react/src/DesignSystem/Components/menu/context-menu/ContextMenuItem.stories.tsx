import {
    Box,
    Button,
    ContextMenu,
    ContextMenuItem as ContextMenuItemComponent,
    ContextMenuItemProps,
    useContextMenu,
} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React, {MouseEvent} from "react";

import {icons} from "../../icon/constants";

export default {
    title: "Web UI/base/Menu/Context menu/ContextMenuItem",
    component: ContextMenuItemComponent,
    args: {
        isLink: false,
    },
    argTypes: {
        icon: {
            description: "Name of the icon to use",
            options: [...Object.keys(icons)],
            control: {
                type: "select",
            },
            defaultValue: "eye",
        },
        label: {
            defaultValue: "my item",
            control: {
                type: "text",
            },
        },
        severity: {
            options: [undefined, "danger"],
            control: {
                type: "select",
            },
        },
    },
} as Meta;

const Template: Story<ContextMenuItemProps> = (args) => {
    const {show} = useContextMenu();
    return (
        <Box>
            <Button onContextMenu={(e: MouseEvent) => show({event: e, id: "MENU_ID"})}>
                Right click to open menu with custom item
            </Button>

            <ContextMenu id={"MENU_ID"}>
                <ContextMenuItemComponent onClick={() => alert("clicked")} {...args} />
            </ContextMenu>
        </Box>
    );
};

export const ContextMenuItem = Template.bind({});
