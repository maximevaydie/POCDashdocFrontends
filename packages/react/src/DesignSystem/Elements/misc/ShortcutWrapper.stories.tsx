import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {ShortcutWrapper, ShortcutWrapperProps} from "./ShortcutWrapper";

export default {
    title: "Web UI/misc/Shortcut",
    component: ShortcutWrapper,
    args: {
        children: "content",
        shortcutKeyCodes: ["Enter", "a"],
        tooltipLabel: "Enter + a",
        isShortcutDisabled: false,
        onShortcutPressed: () => {
            alert("shortcut pressed");
        },
    },
    argTypes: {
        shortcutKeyCodes: {
            defaultValue: undefined,
            control: {
                type: "array",
            },
        },
        tooltipLabel: {
            defaultValue: undefined,
            control: {
                type: "text",
            },
        },
        isShortcutDisabled: {control: "boolean", defaultValue: false},
    },
} as Meta;

const Template: Story<ShortcutWrapperProps> = (args) => <ShortcutWrapper {...args} />;

export const ShortcutWrapperComponent = Template.bind({});
