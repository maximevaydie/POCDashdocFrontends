import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {NetworkMapLegend} from "../NetworkMapLegend";

const Template: Story = () => (
    <>
        <NetworkMapLegend />
    </>
);
export const NetworkMapLegendTemplate = Template.bind({});

export default {
    title: "moderation/components/network/NetworkMap",
    component: NetworkMapLegend,
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;
