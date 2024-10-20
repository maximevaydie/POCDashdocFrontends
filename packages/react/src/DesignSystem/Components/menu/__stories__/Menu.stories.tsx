import {Box} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {MenuItem} from "../MenuItem";
import {MenuSeparator} from "../MenuSeparator";

export default {
    title: "Web UI/base/Menu",
} as Meta;

const Template: Story = () => {
    return (
        <Box backgroundColor="grey.white">
            <MenuItem
                icon="edit"
                label={"edit"}
                onClick={() => {
                    alert("clicked on edit");
                }}
            />
            <MenuItem
                icon="duplicate"
                label={"duplicate"}
                onClick={() => {
                    alert("clicked on duplicate");
                }}
            />
            <MenuSeparator />
            <MenuItem
                icon="bin"
                label={"delete"}
                onClick={() => {
                    alert("clicked on delete");
                }}
            />
        </Box>
    );
};

export const Menu = Template.bind({});
Menu.storyName = "Menu";
