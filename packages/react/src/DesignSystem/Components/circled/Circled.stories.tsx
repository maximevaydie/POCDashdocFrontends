import {Text} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {Circled as Component} from "./Circled";

export default {
    title: "Web UI/Circled",
    component: Component,
    args: {
        text: "1",
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;

const Template: Story<any> = (args) => <Component>{args.text}</Component>;

export const Circled = Template.bind({});

const TemplateCustomized: Story<any> = (args) => (
    <Component>
        <Text variant="h1" color="yellow.dark">
            {args.text}
        </Text>
    </Component>
);

export const CircledCustomized = TemplateCustomized.bind({});
