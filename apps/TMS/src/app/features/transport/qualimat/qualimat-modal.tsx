import {getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Icon, Modal, Text} from "@dashdoc/web-ui";
import React from "react";
import {connect} from "react-redux";

import {RootState} from "app/redux/reducers/index";

type StateProps = {
    companyName: string;
};

type OwnProps = {
    isQualimatEnabled: boolean;
    onClose: () => any;
    onSubmit: () => any;
    submitting: boolean;
};

type QualimatFeatureModalProps = OwnProps & StateProps;

const QualimatFeatureModal = ({
    onClose,
    onSubmit,
    submitting,
    companyName,
    isQualimatEnabled,
}: QualimatFeatureModalProps) => (
    <Modal
        title={t(
            isQualimatEnabled
                ? "qualimatFeature.updateCertificate.modalTitle"
                : "qualimatFeature.modalTitle"
        )}
        id="update-qualimat-modal"
        onClose={onClose}
        data-testid="update-qualimat-modal"
        secondaryButton={{
            disabled: submitting,
            "data-testid": "qualimat-modal-cancel-button",
        }}
        mainButton={{
            onClick: onSubmit,
            disabled: submitting,
            "data-testid": "qualimat-modal-save-button",
            children: t(isQualimatEnabled ? "settings.updateCertificate" : "qualimatFeature.save"),
        }}
    >
        <Text>
            {t(
                isQualimatEnabled
                    ? "qualimatFeature.updateCertificateNumber.modalContent"
                    : "qualimatFeature.modalContent",
                {companyName}
            )}
        </Text>
        {!isQualimatEnabled && (
            <Text pt={2}>
                <Icon pr={2} name="warning" />
                <b>{t("qualimatFeature.modalAlertContent")}</b>
            </Text>
        )}
    </Modal>
);

const mapStateToProps = (state: RootState) => {
    return {
        companyName: getConnectedCompany(state)?.name ?? t("common.notDefined"),
    };
};

export default connect(mapStateToProps)(QualimatFeatureModal);
