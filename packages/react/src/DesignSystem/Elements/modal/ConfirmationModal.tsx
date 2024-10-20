import {t} from "@dashdoc/web-core";
import React, {FunctionComponent, ReactNode} from "react";

import {Text} from "../../Components/Text";

import {Modal, ModalProps} from "./Modal";

export type ConfirmationModalProps = Omit<ModalProps, "id" | "title"> & {
    confirmationMessage?: ReactNode;
    title?: ReactNode;
};

export const ConfirmationModal: FunctionComponent<ConfirmationModalProps> = (props) => {
    const {
        confirmationMessage = t("common.confirmationMessage"),
        title = t("common.warning"),
        ...modalProps
    } = props;

    return (
        <Modal id="confirmation-modal" title={title} {...modalProps}>
            {typeof confirmationMessage === "string" ? (
                <Text>{confirmationMessage}</Text>
            ) : (
                confirmationMessage
            )}
        </Modal>
    );
};
