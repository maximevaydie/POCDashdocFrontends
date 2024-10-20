import {t} from "@dashdoc/web-core";
import {getReadableAddress} from "@dashdoc/web-core";
import {Modal, Text} from "@dashdoc/web-ui";
import {Address} from "dashdoc-utils";
import React from "react";

type ConfirmAddressWithoutGPSModalProps = {
    address: Address;
    onSaveAddress: () => void;
    onClose: () => void;
};

export function ConfirmAddressWithoutGPSModal({
    address,
    onSaveAddress,
    onClose,
}: ConfirmAddressWithoutGPSModalProps) {
    return (
        <Modal
            id="confirm-address-without-gps-modal"
            title={t("addressModal.confirmNoGPSTitle")}
            onClose={onClose}
            mainButton={{
                children: t("addressModal.saveWithoutGPSCoordinates"),
                "data-testid": "confirm-address-without-gps-modal-save",
                severity: "danger",
                onClick: onSaveAddress,
            }}
        >
            <Text>
                {t("addressModal.confirmNoGPSBody", {address: getReadableAddress(address)})}
            </Text>
        </Modal>
    );
}
