import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {Text as TextComponent, textVariants, TextProps} from "../Text";

export default {
    title: "Web UI/base/Text",
    component: TextComponent,
    args: {children: "Text content", variant: "body"},
    argTypes: {
        variant: {
            options: Object.keys(textVariants),
            defaultValue: "body",
            control: {
                type: "select",
            },
        },
    },
} as Meta;

const Template: Story<TextProps> = (args) => <TextComponent {...args} />;

export const Text = Template.bind({});
