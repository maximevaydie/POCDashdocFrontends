import {t} from "@dashdoc/web-core";
import {Callout, ConfirmationModal, Text} from "@dashdoc/web-ui";
import React, {FC} from "react";

type MergeInfoDisabledModalProps = {
    onClose: () => void;
};

export const MergeInfoDisabledModal: FC<MergeInfoDisabledModalProps> = ({onClose}) => {
    return (
        <ConfirmationModal
            title={t("components.invoice.mergingInfoDisabled")}
            confirmationMessage={
                <Callout variant="warning">
                    <Text>{t("components.invoice.mergeDisabled")}</Text>
                </Callout>
            }
            mainButton={{
                severity: "warning",
                children: t("common.confirmUnderstanding"),
                onClick: onClose,
            }}
        />
    );
};
