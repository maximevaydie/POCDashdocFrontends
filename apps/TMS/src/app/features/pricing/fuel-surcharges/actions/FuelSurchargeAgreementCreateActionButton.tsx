import {getConnectedCompanyId, useDispatch} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import {FuelSurchargeAgreement, FuelSurchargeAgreementOwnerType, useToggle} from "dashdoc-utils";
import React from "react";
import {useHistory} from "react-router";

import {onSubmitFuelSurchargeAgreementCreation} from "app/features/pricing/fuel-surcharges/actions/FuelSurchargeAgreementCreateActionDropdown";
import {FuelSurchargeAgreementFormModal} from "app/features/pricing/fuel-surcharges/modals/FuelSurchargeAgreementFormModal";
import {useSelector} from "app/redux/hooks";

interface Props {
    ownerType: FuelSurchargeAgreementOwnerType;
}

export function FuelSurchargeAgreementCreateActionButton({ownerType}: Props) {
    const history = useHistory();
    const dispatch = useDispatch();
    const connectedCompanyPk = useSelector(getConnectedCompanyId);

    const [isModalOpen, openModal, closeModal] = useToggle();

    return (
        <>
            <Button type="button" variant="plain" size="xsmall" pl={0} mt={1} onClick={openModal}>
                <Icon name="add" mr={2} />
                {t("pricingForm.addFuelSurchargeAgreement")}
            </Button>

            {isModalOpen && (
                <FuelSurchargeAgreementFormModal
                    ownerType={ownerType}
                    onSubmit={handleSubmit}
                    onClose={closeModal}
                />
            )}
        </>
    );

    async function handleSubmit(fuelSurchargeAgreement: FuelSurchargeAgreement) {
        const result = await onSubmitFuelSurchargeAgreementCreation(
            connectedCompanyPk,
            dispatch,
            fuelSurchargeAgreement
        );
        if (result) {
            history.push(`/app/fuel-surcharges/${result.uid}`);
        }
    }
}
