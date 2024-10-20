import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {ClickableUpdateRegion as ClickableUpdateRegionComponent} from "../clickable-update-region/ClickableUpdateRegion";
import {ClickableUpdateRegionProps} from "../clickable-update-region/types";

export default {
    title: "Web UI/button/Clickabled Region/ClickableUpdateRegion",
    component: ClickableUpdateRegionComponent,
    args: {
        clickable: true,
        updateButtonLabel: "my update label",
        onClick: () => {},
        children: <h1>my content</h1>,
    },
    argTypes: {
        clickable: {
            defaultValue: true,
            control: {
                type: "boolean",
            },
        },
        updateButtonLabel: {
            defaultValue: "my update label",
            control: {
                type: "text",
            },
        },
    },
} as Meta;

const Template: Story<ClickableUpdateRegionProps> = (args) => (
    <ClickableUpdateRegionComponent {...args} />
);

export const ClickableUpdateRegion = Template.bind({});
