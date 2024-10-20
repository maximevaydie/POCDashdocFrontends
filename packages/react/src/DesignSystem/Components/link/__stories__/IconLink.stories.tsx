import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {icons} from "../../icon/constants";
import {IconLink as IconLinkComponent} from "../IconLink";
import {IconLinkProps} from "../types";

export default {
    title: "Web UI/base/link/IconLink",
    component: IconLinkComponent,
    args: {
        text: "Link content",
        iconName: "add",
        onClick: () => alert("You clicked on the link!"),
    },
    argTypes: {
        iconName: {
            options: icons,
            control: {
                type: "select",
            },
        },
    },
} as Meta;

const Template: Story<IconLinkProps> = (args) => <IconLinkComponent {...args} />;

export const IconLink = Template.bind({});
