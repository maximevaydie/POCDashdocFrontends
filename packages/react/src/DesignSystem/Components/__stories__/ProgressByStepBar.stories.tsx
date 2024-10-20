import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {
    ProgressByStepBar as ProgressByStepBarComponent,
    ProgressBarProps,
} from "../ProgressByStepBar";

export default {
    title: "Web UI/base/ProgressByStepBar",
    component: ProgressByStepBarComponent,
    args: {
        items: [
            {label: "step 1", active: true},
            {label: "step 2", active: true},
            {label: "step 3", active: true, danger: true},
            {label: "step 4", active: false},
            {label: "step 5", active: false},
        ],
    },
} as Meta;

const Template: Story<ProgressBarProps> = (args) => <ProgressByStepBarComponent {...args} />;

export const ProgressByStepBar = Template.bind({});
