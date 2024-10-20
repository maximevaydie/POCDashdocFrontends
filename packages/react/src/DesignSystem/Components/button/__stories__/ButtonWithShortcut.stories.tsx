import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {ButtonWithShortcut, ButtonWithShortcutProps} from "../../misc/ShortcutWrapper";

export default {
    title: "Web UI/button/Shortcut",
    component: ButtonWithShortcut,
    args: {
        children: "content",
        shortcutKeyCodes: ["Enter", "a"],
        tooltipLabel: "Enter + a",
        isShortcutDisabled: false,
        onClick: () => {
            alert("button click or shortcut pressed");
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

const Template: Story<ButtonWithShortcutProps> = (args) => <ButtonWithShortcut {...args} />;

export const ButtonWithShortcutComponent = Template.bind({});
