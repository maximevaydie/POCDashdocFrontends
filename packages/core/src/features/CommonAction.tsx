import {Logger} from "@dashdoc/web-core";
import {Button, ButtonProps, toast} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";
import {ToastContent} from "react-toastify";

export interface CommonModalProps<T> {
    onSubmit: (result: T) => void;
    isSubmitting: boolean;
    isReadOnly: boolean;
    onClose: () => void;
}

export type CommonActionProps<T> = {
    onAction: (modalData: T) => Promise<unknown>;
    buttonLabel: React.ReactText;
    errorToastMessage?: ToastContent;
    isReadOnly?: boolean;
    modalComponent: (props: CommonModalProps<T>) => JSX.Element;
} & Partial<ButtonProps>;
export const CommonAction = <T,>(props: CommonActionProps<T>) => {
    const [modalVisible, openModal, closeModal] = useToggle();
    const [isSubmitting, startSubmitting, stopSubmitting] = useToggle();
    const {
        buttonLabel,
        errorToastMessage,
        modalComponent: ModalComponent,
        onAction,
        isReadOnly,
        ...buttonProps
    } = props;
    const onSubmit = async (modalData: T) => {
        startSubmitting();
        try {
            await onAction(modalData);
            closeModal();
        } catch (e) {
            Logger.error(e.message);
            if (errorToastMessage) {
                toast.error(errorToastMessage);
            }
        } finally {
            stopSubmitting();
        }
    };
    let modalContent;
    if (modalVisible) {
        modalContent = (
            <ModalComponent
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                // @ts-ignore
                isReadOnly={isReadOnly}
                onClose={closeModal}
            />
        );
    }
    return (
        <>
            <Button onClick={openModal} {...buttonProps}>
                {buttonLabel}
            </Button>
            {modalContent}
        </>
    );
};
