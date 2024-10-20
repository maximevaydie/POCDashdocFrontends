import {Box, Button} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {FloatingPanel as FloatingPanelComponent, FloatingPanelProps} from "../FloatingPanel";

export default {
    title: "Web UI/modal/FloatingPanel",
    component: FloatingPanelComponent,
} as Meta;

const Template: Story<FloatingPanelProps> = (args) => {
    const [isOpen, open, close] = useToggle();

    return (
        <Box>
            <Button onClick={open}>show pannel</Button>
            {isOpen && <FloatingPanelComponent {...args} onClose={close} />}
        </Box>
    );
};
export const FloatingPanel = Template.bind({});
