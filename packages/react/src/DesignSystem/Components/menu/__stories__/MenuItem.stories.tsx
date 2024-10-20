import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {icons} from "../../icon/constants";
import {MenuItem as MenuItemComponent, MenuItemProps} from "../MenuItem";

export default {
    title: "Web UI/base/Menu/MenuItem",
    component: MenuItemComponent,
    args: {
        icon: "edit",
        label: "label",
        isLink: false,
        withSubMenuArrow: false,
        onClick: () => alert("onClick"),
        dataTestId: "test-id",
    },
    argTypes: {
        icon: {
            description: "Name of the icon to use",
            options: [...Object.keys(icons)],
            control: {
                type: "select",
            },
            defaultValue: "edit",
        },
        iconColor: {
            description: "Color of the icon",
            control: {
                type: "text",
            },
            defaultValue: undefined,
        },
        label: {
            defaultValue: "my item",
            control: {
                type: "text",
            },
        },
        isLink: {
            defaultValue: false,
            control: {
                type: "boolean",
            },
        },
        withSubMenuArrow: {
            defaultValue: false,
            control: {
                type: "boolean",
            },
        },
        severity: {
            options: [undefined, "danger"],
            control: {
                type: "select",
            },
        },
        dataTestId: {
            defaultValue: "test-id",
            control: {
                type: "text",
            },
        },
    },
} as Meta;

const Template: Story<MenuItemProps> = (args) => {
    return <MenuItemComponent {...args} />;
};

export const MenuItem = Template.bind({});
