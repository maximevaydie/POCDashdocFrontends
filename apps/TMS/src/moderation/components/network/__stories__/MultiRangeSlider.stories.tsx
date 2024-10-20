import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {MultiRangeSlider} from "../filters/MultiRangeSlider";

const Template: Story = (args) => {
    return (
        <>
            <MultiRangeSlider
                min={args.min}
                max={args.max}
                onChange={args.onchange}
                width={300}
                {...args}
            />
        </>
    );
};

export const MultiRangeSliderTemplate = Template.bind({});

export default {
    title: "moderation/components/network/MultiRange",
    component: MultiRangeSlider,
    parameters: {
        backgrounds: {default: "transparent"},
    },
    args: {
        min: 0,
        max: 100,
        onchange: () => {},
        label: "label",
    },
} as Meta;
