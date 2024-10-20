import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {Link as LinkComponent} from "../Link";
import {LinkProps} from "../types";

export default {
    title: "Web UI/base/link/Link",
    component: LinkComponent,
    args: {children: "Link content"},
} as Meta;

const Template: Story<LinkProps> = (args) => <LinkComponent {...args} />;

export const Link = Template.bind({});
