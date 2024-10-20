import {BuildConstants, t} from "@dashdoc/web-core";
import {Box, Modal, Text} from "@dashdoc/web-ui";
import React from "react";
import {connect} from "react-redux";

import {getConnectedManager} from "../../../../../react/Redux/accountSelector";
import {CommonRootState} from "../../../../../react/Redux/types";

type OwnProps = {
    onClose: () => void;
};

type StateProps = {
    name: string;
};

type SwitchCompanyDemoModalProps = OwnProps & StateProps;

function SwitchCompanyDemoModal({name, onClose}: SwitchCompanyDemoModalProps) {
    return (
        <Modal
            title={<div className="text-center">{t("components.switchDemoModalTitle")}</div>}
            id="switch-company-demo-modal"
            onClose={onClose}
            mainButton={null}
            secondaryButton={null}
        >
            <Box data-testid="switch-company-demo-modal">
                <Text>{t("components.switchDemoModalHello", {name})}</Text>
                <Text>{t("components.switchDemoModalBody")}</Text>
                <img src={`${BuildConstants.staticUrl}img/switch-company-demo.gif`} />
            </Box>
        </Modal>
    );
}

const mapStateToProps = (state: CommonRootState): StateProps => {
    const connectedManager = getConnectedManager(state);
    let name = "";
    if (connectedManager) {
        name = connectedManager.user?.first_name || "";
    }
    return {name};
};

// eslint-disable-next-line import/no-default-export
export default connect<StateProps, undefined, OwnProps>(mapStateToProps)(SwitchCompanyDemoModal);
