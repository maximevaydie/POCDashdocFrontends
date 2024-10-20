import {t} from "@dashdoc/web-core";
import {Modal, Text, ModalProps} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

export const BusinessPrivacyInformationModal: FunctionComponent<Partial<ModalProps>> = (props) => {
    return (
        <Modal
            title={t("common.businessPrivacy")}
            id="business-privacy-information"
            secondaryButton={null}
            mainButton={{
                children: t("common.confirmUnderstanding"),
                onClick: props.onClose,
            }}
            {...props}
        >
            <Text>{t("common.businessPrivacy.helpText")}</Text>
        </Modal>
    );
};
