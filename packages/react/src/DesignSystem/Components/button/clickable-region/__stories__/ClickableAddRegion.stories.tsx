import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {ClickableAddRegion as ClickableAddRegionComponent} from "../ClickableAddRegion";

export default {
    title: "Web UI/button/Clickabled Region/ClickableAddRegion",
    component: ClickableAddRegionComponent,
} as Meta;

const Template: Story = () => (
    <ClickableAddRegionComponent> add content</ClickableAddRegionComponent>
);

export const ClickableAddRegion = Template.bind({});
