import {
    Box,
    Flex,
    ModalBase,
    ModalFooter,
    ButtonProps,
    ModalBaseProps,
    renderInModalPortal,
} from "@dashdoc/web-ui";
import React, {PropsWithChildren, ReactNode} from "react";

import {StepperSidebar} from "./StepperSidebar";

export type StepperModalProps = ModalBaseProps & {
    mainButton: ButtonProps | null;
    secondaryButton?: ButtonProps | null;
    additionalFooterContent?: ReactNode;
    currentStep: number;
    stepTitles: string[];
};

const StepperModalComponent = ({
    id,
    title,
    onClose,
    onShown,
    size = "medium",
    children,
    additionalFooterContent,
    mainButton,
    secondaryButton,
    animation = true,
    overlayColor,
    preventClosingByMouseClick = false,
    calloutProps,
    currentStep,
    stepTitles,
    ...props
}: StepperModalProps) => {
    return (
        <ModalBase
            id={id}
            title={title}
            onClose={onClose}
            onShown={onShown}
            size={size}
            animation={animation}
            overlayColor={overlayColor}
            preventClosingByMouseClick={preventClosingByMouseClick}
            calloutProps={calloutProps}
            {...props}
        >
            <Flex flexDirection="row">
                <StepperSidebar currentStep={currentStep} stepTitles={stepTitles} />
                <Flex flexDirection="column" px={5} pt={5} pb={4} flex={1}>
                    {children}
                    <Box flex={1} />
                    <ModalFooter
                        mainButton={mainButton}
                        secondaryButton={secondaryButton}
                        additionalFooterContent={additionalFooterContent}
                        onClose={onClose}
                        {...props}
                    />
                </Flex>
            </Flex>
        </ModalBase>
    );
};

export function StepperModal({rootId, ...modalProps}: PropsWithChildren<StepperModalProps>) {
    return renderInModalPortal(<StepperModalComponent {...modalProps} />, rootId);
}
