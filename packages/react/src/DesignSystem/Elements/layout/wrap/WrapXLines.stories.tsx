import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {WrapXLines as WrapXLinesComponent, WrapXLinesProps} from "./WrapXLines";

export default {
    title: "Web UI/layout/wrap/WrapXLines",
    component: WrapXLinesComponent,
    args: {numberOfLines: 3},
} as Meta;

const Template: Story<WrapXLinesProps> = (props) => (
    <WrapXLinesComponent {...props} width="200px">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
        ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
        ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
        sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
        laborum
    </WrapXLinesComponent>
);

export const WrapXLines = Template.bind({});
