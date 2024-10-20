import {Box, Button} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {
    FloatingPanelWithValidationButtons,
    FloatingPanelWithValidationButtonsProps,
} from "../FloatingPanel";

export default {
    title: "Web UI/modal/FloatingPanelWithValidationButtons",
    component: FloatingPanelWithValidationButtons,
    args: {
        title: "My title",
        secondaryButton: [{variant: "plain", children: "Secondary Button"}],
        mainButton: {children: "Main Button"},
        indications: ["indication 1", " indication 2"],
    },
} as Meta;

const Template: Story<FloatingPanelWithValidationButtonsProps> = (args) => {
    const [isOpen, open, close] = useToggle();

    return (
        <Box>
            <Button onClick={open}>show pannel with validation buttons</Button>
            {isOpen && <FloatingPanelWithValidationButtons {...args} onClose={close} />}
        </Box>
    );
};
export const FloatingPanel = Template.bind({});
