import {Box} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {GroupedSelectMenu as Component, GroupedSelectMenuProps} from "./GroupedSelectMenu";

const Template: Story<GroupedSelectMenuProps> = (args) => (
    <Box width="900px">
        <Component {...args} />
    </Box>
);

export const GroupedSelectMenu = Template.bind({});
export default {
    title: "Web UI/misc",
    component: Component,
    args: {
        optionsByGroup: [
            {
                label: "group 1",
                options: [
                    {
                        label: "option 1",
                        value: "1",
                        isInitiallyChecked: false,
                    },
                    {
                        label: "option 2",
                        value: "2",
                        isInitiallyChecked: true,
                    },
                    {
                        label: "option 3",
                        value: "3",
                        isInitiallyChecked: false,
                    },
                ],
                onSelect: (value: string) => {
                    alert("selected value: " + value);
                },
            },
            {
                label: "group 2",
                options: [
                    {
                        label: "option 1",
                        value: "1",
                        isInitiallyChecked: false,
                    },
                    {
                        label: "option 2",
                        value: "2",
                        isInitiallyChecked: true,
                    },
                    {
                        label: "option 3",
                        value: "3",
                        isInitiallyChecked: false,
                    },
                ],
                onSelect: (value: string) => {
                    alert("selected value: " + value);
                },
            },
            {
                label: "group 3",
                options: [
                    {
                        label: "option 1",
                        value: "1",
                        isInitiallyChecked: false,
                    },
                    {
                        label: "option 2",
                        value: "2",
                        isInitiallyChecked: true,
                    },
                    {
                        label: "option 3",
                        value: "3",
                        isInitiallyChecked: false,
                    },
                ],
                onSelect: (value: string) => {
                    alert("selected value: " + value);
                },
            },
        ],
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;
