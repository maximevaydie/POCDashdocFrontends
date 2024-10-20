import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {icons} from "../../base/icon/constants";
import {IconButton as IconButtonComponent, IconButtonProps} from "../IconButton";

export default {
    title: "Web UI/button/IconButton",
    component: IconButtonComponent,
    args: {
        name: "filter",
        disabled: false,
        loading: false,
        active: false,
        withConfirmation: false,
    },
    argTypes: {
        theme: {table: {disable: true}},
        as: {table: {disable: true}},
        ["data-testid"]: {table: {disable: true}},
        tracking: {table: {disable: true}},
        name: {
            options: icons,
            defaultValue: "filter",
            control: {
                type: "select",
            },
        },
        label: {
            defaultValue: undefined,
            control: {
                type: "text",
            },
        },
        confirmationMessage: {
            defaultValue: undefined,
            control: {
                type: "text",
            },
        },
    },
} as Meta;

const Template: Story<IconButtonProps> = (args) => <IconButtonComponent {...args} />;

export const IconButton = Template.bind({});

export const IconButtonWithLabel = Template.bind({});
IconButtonWithLabel.storyName = "IconButton with label";
IconButtonWithLabel.args = {
    label: "Filter",
};

export const IconButtonWithConfirmation = Template.bind({});
IconButtonWithConfirmation.storyName = "IconButton with confirmation";
IconButtonWithConfirmation.args = {
    withConfirmation: true,
};
