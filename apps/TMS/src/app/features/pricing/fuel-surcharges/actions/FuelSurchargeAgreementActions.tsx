import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {Button, Flex, Icon, IconButton, Popover} from "@dashdoc/web-ui";
import {theme} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {FuelSurchargeAgreementDeleteModal} from "app/features/pricing/fuel-surcharges/modals/FuelSurchargeAgreementDeleteModal";
import {FuelSurchargeAgreementRenameModal} from "app/features/pricing/fuel-surcharges/modals/FuelSurchargeAgreementRenameModal";
import {
    fetchDeleteFuelSurchargeAgreement,
    fetchUpdateFuelSurchargeAgreement,
} from "app/redux/actions/fuel-surcharge/fuel-surcharge-agreement";
import {useDispatch} from "app/redux/hooks";
import {FuelSurchargeAgreement} from "app/screens/invoicing/FuelSurchargesScreen";

type Props = {
    onSuccess: () => void;
    fuelSurchargeAgreement: FuelSurchargeAgreement;
};

export const FuelSurchargeAgreementActions: React.FC<Props> = ({
    onSuccess,
    fuelSurchargeAgreement,
}) => {
    const [isRenameModalOpen, openRenameModal, closeRenameModal] = useToggle();
    const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle();
    const dispatch = useDispatch();

    const onRename = async (name: FuelSurchargeAgreement["name"]) => {
        try {
            const updateFuelSurchargeAgreementRequest = dispatch(
                fetchUpdateFuelSurchargeAgreement(fuelSurchargeAgreement.uid, {name})
            );
            await updateFuelSurchargeAgreementRequest;
            onSuccess();
        } catch (e) {
            Logger.error("Failed to update a fuel surcharge agreement", e);
        }
    };

    const onDelete = async () => {
        try {
            const deleteFuelSurchargeAgreementRequest = dispatch(
                fetchDeleteFuelSurchargeAgreement(fuelSurchargeAgreement.uid)
            );
            await deleteFuelSurchargeAgreementRequest;
            onSuccess();
        } catch (e) {
            Logger.error("Failed to delete a fuel surcharge agreement", e);
        }
    };

    return (
        <Popover placement="right">
            <Popover.Trigger>
                <IconButton name="moreActions" />
            </Popover.Trigger>
            <Popover.Content>
                <Button
                    justifyContent="flex-start"
                    variant="plain"
                    color={`${theme.colors.grey.dark} !important`}
                    onClick={openRenameModal}
                >
                    <Flex alignContent="flex-start">
                        <Icon name="edit" mr={2} />
                        {t("common.rename")}
                    </Flex>
                </Button>
                {isRenameModalOpen && (
                    <FuelSurchargeAgreementRenameModal
                        fuelSurchargeAgreementName={fuelSurchargeAgreement.name}
                        onClose={closeRenameModal}
                        onSubmit={onRename}
                    />
                )}
                <Button
                    justifyContent="flex-start"
                    variant="plain"
                    color={`${theme.colors.grey.dark} !important`}
                    onClick={openDeleteModal}
                >
                    <Flex alignContent="flex-start">
                        <Icon name="delete" mr={2} />
                        {t("common.delete")}
                    </Flex>
                </Button>
                {isDeleteModalOpen && (
                    <FuelSurchargeAgreementDeleteModal
                        fuelSurchargeAgreementName={fuelSurchargeAgreement.name}
                        onClose={closeDeleteModal}
                        onDelete={onDelete}
                    />
                )}
            </Popover.Content>
        </Popover>
    );
};
