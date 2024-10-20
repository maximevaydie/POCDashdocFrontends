import {t} from "@dashdoc/web-core";
import {Modal, TextInput} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {FuelSurchargeAgreement} from "app/screens/invoicing/FuelSurchargesScreen";

type FuelSurchargeAgreeementRenameModalProps = {
    fuelSurchargeAgreementName: FuelSurchargeAgreement["name"];
    onClose: () => void;
    onSubmit: (name: FuelSurchargeAgreement["name"]) => void;
};
export const FuelSurchargeAgreementRenameModal: React.FC<
    FuelSurchargeAgreeementRenameModalProps
> = ({fuelSurchargeAgreementName, onClose, onSubmit}) => {
    const [name, setName] = useState(fuelSurchargeAgreementName);

    const onConfirm = () => {
        {
            onSubmit(name);
        }
    };

    return (
        <Modal
            title={t("fuelSurcharges.renameFuelSurchargeAgreementTitle")}
            mainButton={{
                disabled: !name,
                children: t("common.rename"),
                onClick: onConfirm,
            }}
            secondaryButton={{
                onClick: onClose,
            }}
            onClose={onClose}
        >
            <TextInput
                required={true}
                label={t("common.name")}
                value={name}
                onChange={(value) => {
                    setName(value);
                }}
            />
        </Modal>
    );
};
