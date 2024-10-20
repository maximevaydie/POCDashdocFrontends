import {Meta, Story} from "@storybook/react";
import React from "react";

import {PaneButtonGroupItemProps, PaneButtonGroupItem} from "../PaneButtonGroupItem";

export default {
    title: "Web UI/screen/PaneButtonGroup/PaneButtonGroupItem",
    component: PaneButtonGroupItem,
} as Meta;

const Template: Story<PaneButtonGroupItemProps> = (args: PaneButtonGroupItemProps) => (
    <div style={{backgroundColor: "white", width: "100%", height: "100%"}}>
        <PaneButtonGroupItem {...args} />
    </div>
);

export const Default = Template.bind({});
Default.args = {
    label: "This is my label",
    active: false,
    onClick: () => {
        alert("click!");
    },
    id: "1",
};

export const Icon = Template.bind({});
Icon.args = {
    icon: "search",
    label: "This is my label",
    active: false,
    onClick: () => {
        alert("click!");
    },
    id: "1",
};

export const Active = Template.bind({});
Active.args = {
    label: "This is my label",
    active: true,
    onClick: () => {
        alert("click!");
    },
    id: "1",
};
