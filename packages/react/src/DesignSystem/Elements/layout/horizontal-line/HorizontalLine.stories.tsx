import {Meta, Story} from "@storybook/react";
import React from "react";

import {HorizontalLine, HorizontalLineProps} from "./HorizontalLine";

export default {
    title: "Web UI/HorizontalLine",
    component: HorizontalLine,
} as Meta;

const Template: Story<HorizontalLineProps> = (args) => (
    <div style={{width: "500px", height: "100px", backgroundColor: "white"}}>
        <HorizontalLine {...args} />
    </div>
);

export const Default = Template.bind({});
Default.args = {};

export const CustomPadding = Template.bind({});
CustomPadding.args = {
    paddingY: 4,
};

export const CustomColor = Template.bind({});
CustomColor.args = {
    borderColor: "red.200",
    size: 1,
};
