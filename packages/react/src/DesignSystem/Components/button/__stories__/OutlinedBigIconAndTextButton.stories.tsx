import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {icons} from "../../base/icon/constants";
import {
    OutlinedBigIconAndTextButton as OutlinedBigIconAndTextButtonComponent,
    OutlinedBigIconAndTextButtonProps,
} from "../OutlinedBigIconAndTextButton";

export default {
    title: "Web UI/button/OutlinedBigIconAndTextButton",
    component: OutlinedBigIconAndTextButtonComponent,
    args: {
        iconName: "filter",
        label: "My label",
        active: true,
        onClick: () => {},
    },
    argTypes: {
        iconName: {
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
        active: {
            defaultValue: true,
            control: {
                type: "boolean",
            },
        },
        dataTestId: {
            defaultValue: "",
            control: {
                type: "text",
            },
        },
    },
} as Meta;

const Template: Story<OutlinedBigIconAndTextButtonProps> = (args) => (
    <OutlinedBigIconAndTextButtonComponent {...args} />
);

export const OutlinedBigIconAndTextButton = Template.bind({});
