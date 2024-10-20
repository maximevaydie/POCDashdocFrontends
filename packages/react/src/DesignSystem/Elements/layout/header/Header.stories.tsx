import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {Header as HeaderComponent, HeaderProps} from "./Header";

export default {
    title: "Web UI/layout/Header",
    component: HeaderComponent,
    args: {title: "header title", icon: "filter", children: "Header content"},
} as Meta;

const Template: Story<HeaderProps> = (props) => <HeaderComponent {...props} />;

export const Header = Template.bind({});
