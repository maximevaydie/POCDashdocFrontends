import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {Card, Props} from "./Card";

export default {
    title: "flow/features/zones/Card",
    component: Card,
} as Meta;

const Template: Story<Props> = (args) => <Card {...args} />;

export const Default = Template.bind({});
Default.args = {
    start: "8:20",
    topText: "2340239, 20934",
    bottomText: "Transports Johnny",
    rightComponent: <div>!</div>,
    width: 316,
};

export const WithEnd = Template.bind({});
WithEnd.args = {
    start: "9:00",
    end: "12:00",
    topText: "Unavailability",
    bottomText: "School strike",
    rightComponent: null,
    backgroundColor: "yellow.light",
    width: 316,
};

export const WithLongText = Template.bind({});
WithLongText.args = {
    start: "9:00",
    end: "12:00",
    topText: "This is a very long text that should be truncated",
    bottomText: "This is a very long text that should be truncated too",
    rightComponent: null,
    width: 316,
};
