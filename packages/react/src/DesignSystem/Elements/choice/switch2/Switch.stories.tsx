import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {SwitchInput as SwitchComponent, SwitchInputProps} from "./SwitchInput";

export default {
    title: "Web UI/choice/Switch",
    component: SwitchComponent,
    args: {
        disabled: false,
        labelRight: "my right label",
        labelLeft: "my left label",
    },
} as Meta;

const Template: Story<SwitchInputProps> = (args) => <SwitchComponent {...args} />;

export const Switch = Template.bind({});
