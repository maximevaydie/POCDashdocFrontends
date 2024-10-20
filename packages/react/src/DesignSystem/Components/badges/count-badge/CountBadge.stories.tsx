import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {CountBadge as CountBadgeComponent} from "./CountBadge";

export default {
    title: "Web UI/base/badges/CountBadge",
    component: CountBadgeComponent,
    args: {
        value: 10,
    },
} as Meta;

const Template: Story<{value: number}> = (args) => <CountBadgeComponent {...args} />;

export const CountBadge = Template.bind({});
