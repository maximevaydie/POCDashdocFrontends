import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {Tabs, TabsProps} from "../tabs/Tabs";

export default {
    title: "Web UI/base/Tabs",
    component: Tabs,
    args: {
        tabs: [
            {
                label: "tab 1",
                content: "content 1",
            },
            {
                label: "tab 2",
                content: "content 2",
            },
            {
                label: "tab 3",
                content: "content 3",
            },
        ],
        actionButton: "",
    },
} as Meta;

const Template: Story<TabsProps> = (args) => <Tabs {...args} />;

export const TabsComponent = Template.bind({});
