import {Meta, Story} from "@storybook/react";
import React from "react";

import {PaneButtonGroupProps, PaneButtonGroup} from "../index";
import {PaneButtonGroupItem} from "../PaneButtonGroupItem";

export default {
    title: "Web UI/screen/PaneButtonGroup/PaneButtonGroup",
    component: PaneButtonGroup,
} as Meta;

const Template: Story<PaneButtonGroupProps> = (args) => <PaneButtonGroup {...args} />;

export const Default = Template.bind({});

Default.args = {
    title: "Pane Button Group Title",
    scrollable: true,
    children: (
        <>
            <PaneButtonGroupItem label="Link" active icon="link" />
            <PaneButtonGroupItem label="Search" icon="search" />
            <PaneButtonGroupItem label="Item 3" />
        </>
    ),
};
