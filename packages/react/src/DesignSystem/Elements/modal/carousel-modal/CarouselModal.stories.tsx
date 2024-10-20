import {Box, Button} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {CarouselModal as Component} from "./CarouselModal";
import {CarouselModalProps} from "./types";

export default {
    title: "Web UI/modal/CarouselModal",
    component: Component,
    args: {
        steps: [
            {
                header: "First step",
                content: "First step content",
            },
            {
                header: "Second step",
                content: "Second step content",
            },
            {
                header: "Third step",
                content: "Third step content",
            },
        ],
        finalStepConfirmLabel: "Close",
    },
} as Meta;

const Template: Story<CarouselModalProps> = (args) => {
    const [isModalVisible, openModal, closeModal] = useToggle();

    return (
        <Box>
            <Button onClick={openModal}>show carousel</Button>
            {isModalVisible && <Component {...args} onClose={closeModal} />}
        </Box>
    );
};

export const CarouselModal = Template.bind({});
