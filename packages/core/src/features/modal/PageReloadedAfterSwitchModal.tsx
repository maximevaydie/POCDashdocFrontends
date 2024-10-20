import {t} from "@dashdoc/web-core";
import {Modal, Text} from "@dashdoc/web-ui";
import React from "react";
import {connect} from "react-redux";

import {getConnectedCompany} from "../../../../../react/Redux/accountSelector";
import {CommonRootState} from "../../../../../react/Redux/types";

type OwnProps = {
    onClose: () => void;
};

type StateProps = {
    companyName: string;
};

type PageReloadedAfterSwitchModalProps = OwnProps & StateProps;

function PageReloadedAfterSwitchModal({companyName, onClose}: PageReloadedAfterSwitchModalProps) {
    return (
        <Modal
            title={t("pageReloadedAfterSwitchModal.title")}
            id="page-reloaded-after-switch-modal"
            data-testid="page-reloaded-after-switch-modal"
            onClose={onClose}
            mainButton={{
                onClick: onClose,
                children: t("common.understood"),
            }}
            secondaryButton={null}
        >
            <Text>{t("pageReloadedAfterSwitchModal.body", {companyName})}</Text>
        </Modal>
    );
}

const mapStateToProps = (state: CommonRootState): StateProps => {
    const companyName = getConnectedCompany(state)?.name ?? "";
    return {companyName};
};

// eslint-disable-next-line import/no-default-export
export default connect<StateProps, undefined, OwnProps>(mapStateToProps)(
    PageReloadedAfterSwitchModal
);
