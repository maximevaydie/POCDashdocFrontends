import {Box, Button, Modal as ModalComponent, ModalProps, Text} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import {useToggle} from "dashdoc-utils";
import React from "react";

export default {
    title: "Web UI/modal",
    component: ModalComponent,
    args: {
        children: "Modal content",
        id: "modal-id",
        title: "Modal title",
        secondaryButton: {children: "Secondary Button"},
        mainButton: {children: "Main Button"},
    },
} as Meta;

const Template: Story<ModalProps> = (args) => {
    const [isModalVisible, openModal, closeModal] = useToggle();

    const additionalFooterContent = (
        <Box backgroundColor="grey.light" p={2}>
            <Text>Additional Footer content</Text>
        </Box>
    );
    return (
        <Box>
            <Button onClick={openModal}>show modal</Button>
            {isModalVisible && (
                <ModalComponent
                    {...args}
                    additionalFooterContent={additionalFooterContent}
                    onClose={closeModal}
                />
            )}
        </Box>
    );
};

export const Modal = Template.bind({});

export const NestedModals: Story<ModalProps> = (args) => {
    const [isModalVisible, openModal, closeModal] = useToggle();

    return (
        <>
            <Template {...args} mainButton={{children: "Show nested modal", onClick: openModal}} />
            {isModalVisible && <ModalComponent {...args} onClose={closeModal} />}
        </>
    );
};
NestedModals.storyName = "Modal with nested modal";
