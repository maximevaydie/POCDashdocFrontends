import {t} from "@dashdoc/web-core";
import {Callout, Modal, Text} from "@dashdoc/web-ui";
import React, {FC} from "react";

type OutdatedTruckerAppModalProps = {
    onSubmit: () => void;
};

export const OutdatedTruckerAppModal: FC<OutdatedTruckerAppModalProps> = ({onSubmit}) => {
    return (
        <Modal
            mainButton={{
                type: "button",
                onClick: onSubmit,
                children: t("common.understood"),
            }}
            title={t("components.outdatedApp")}
            data-testid="outdated-trucker-app-modal"
        >
            <Callout variant="warning">
                <Text>{t("components.truckerOutdatedAppVersionWarning")}</Text>
                <Text mt={3}>{t("components.inviteTruckerToUpdateHisApp")}</Text>
            </Callout>
        </Modal>
    );
};
