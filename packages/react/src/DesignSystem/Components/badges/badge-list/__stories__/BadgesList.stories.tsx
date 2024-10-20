import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {BadgeList as BadgeListComponents} from "../BadgeList";

export default {
    title: "Web UI/base/badges/BadgeList",
    component: BadgeListComponents,
    args: {
        values: ["05/04/2022 - 05/05/2022", "Nantes", "Rennes"],
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;

const Template: Story<any> = (args) => <BadgeListComponents id={0} {...args} />;

export const BadgeList = Template.bind({});
