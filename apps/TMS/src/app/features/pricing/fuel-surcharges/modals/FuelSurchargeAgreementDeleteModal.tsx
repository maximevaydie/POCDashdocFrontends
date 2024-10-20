import {t} from "@dashdoc/web-core";
import {Callout, Flex, Modal, Text} from "@dashdoc/web-ui";
import {FuelSurchargeAgreement} from "dashdoc-utils";
import React from "react";

type FuelSurchargeAgreementDeleteModalProps = {
    fuelSurchargeAgreementName: FuelSurchargeAgreement["name"];
    onDelete: () => void;
    onClose: () => void;
};

export const FuelSurchargeAgreementDeleteModal: React.FC<
    FuelSurchargeAgreementDeleteModalProps
> = ({onDelete, onClose, fuelSurchargeAgreementName}) => {
    return (
        <Modal
            title={t("fuelSurcharges.deleteFuelSurchargeAgreementTitle")}
            mainButton={{
                severity: "danger",
                children: t("fuelSurcharges.deleteFuelSurchargeAgreement"),
                onClick: onDelete,
            }}
            secondaryButton={{
                onClick: onClose,
            }}
            onClose={onClose}
        >
            <Flex flexDirection="column" style={{rowGap: "16px"}}>
                <Text>
                    {t("fuelSurcharges.titleDeleteFuelSurchargeAgreement", {
                        name: fuelSurchargeAgreementName,
                    })}
                </Text>
                <Callout borderRadius="5px" p="4">
                    <Text>{t("fuelSurcharges.calloutDeleteFuelSurchargeAgreement")}</Text>
                </Callout>
                <Text>{t("fuelSurcharges.confirmDeleteFuelSurchargeAgreement")}</Text>
            </Flex>
        </Modal>
    );
};
