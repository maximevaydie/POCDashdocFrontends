import {Box} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react";
import React from "react";

import {
    TextInputEditableList as Component,
    TextInputEditableListProps,
} from "./TextInputEditableList";

const Template: Story<TextInputEditableListProps> = (args) => (
    <Box width="600px">
        <Component {...args} />
    </Box>
);
export const TextInputEditableList = Template.bind({});
export default {
    title: "Web UI/input/TextInputEditableList",
    component: Component,
    args: {
        onChange: () => {
            return;
        },
        addItemLabel: "Add item",
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;
