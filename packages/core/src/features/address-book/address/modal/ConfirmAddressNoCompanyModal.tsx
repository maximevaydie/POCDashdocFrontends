import {t} from "@dashdoc/web-core";
import {Box, Modal} from "@dashdoc/web-ui";
import React from "react";

type ConfirmAddressNoCompanyModalProps = {
    onConfirm: () => void;
    onClose: () => void;
};

export function ConfirmAddressNoCompanyModal({
    onConfirm,
    onClose,
}: ConfirmAddressNoCompanyModalProps) {
    return (
        <Modal
            title={t("addressModal.confirmNoCompanyTitle")}
            onClose={onClose}
            id="address-confirm-no-company-modal"
            data-testid="address-confirm-no-company-modal"
            mainButton={{
                children: t("common.confirm"),
                onClick: onConfirm,
                "data-testid": "address-confirm-no-company-confirm-button",
            }}
            secondaryButton={{
                variant: "plain",
                "data-testid": "address-confirm-no-company-cancel-button",
            }}
        >
            <Box>{t("addressModal.confirmNoCompanyMessage")}</Box>
        </Modal>
    );
}
