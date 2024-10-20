import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {Button, Flex, Icon, IconButton, Popover} from "@dashdoc/web-ui";
import {theme} from "@dashdoc/web-ui";
import {FuelPriceIndex, useToggle} from "dashdoc-utils";
import isNil from "lodash.isnil";
import omitBy from "lodash.omitby";
import React from "react";

import {FuelPriceIndexFormModal} from "app/features/pricing/fuel-surcharges/modals/FuelPriceIndexFormModal";
import {
    fetchDeleteFuelPriceIndex,
    fetchUpdateFuelPriceIndex,
} from "app/redux/actions/fuel-surcharge/fuel-price-indexes";
import {useDispatch} from "app/redux/hooks";

type Props = {
    fuelPriceIndex: FuelPriceIndex;
    onActionSuccess: () => void;
};

export const FuelPriceIndexesActions: React.FC<Props> = ({fuelPriceIndex, onActionSuccess}) => {
    const dispatch = useDispatch();
    const [isFuelPriceIndexFormModal, openFuelPriceIndexForm, closeFuelPriceIndexFormModal] =
        useToggle();

    const onDelete = async () => {
        try {
            const deleteFuelPriceIndexRequest = dispatch(
                fetchDeleteFuelPriceIndex(fuelPriceIndex.uid)
            );
            await deleteFuelPriceIndexRequest;
            onActionSuccess();
        } catch (e) {
            Logger.error(e);
        }
    };

    const onUpdate = async (updatedFuelPriceIndex: FuelPriceIndex) => {
        try {
            const updateFuelPriceIndexRequest = dispatch(
                fetchUpdateFuelPriceIndex(fuelPriceIndex.uid, omitBy(updatedFuelPriceIndex, isNil))
            );
            await updateFuelPriceIndexRequest;
            onActionSuccess();
            closeFuelPriceIndexFormModal();
        } catch (e) {
            Logger.error(e);
        }
    };
    return (
        <Popover>
            <Popover.Trigger>
                <IconButton name="moreActions" />
            </Popover.Trigger>
            <Popover.Content>
                <Button
                    justifyContent="flex-start"
                    variant="plain"
                    color={`${theme.colors.grey.dark} !important`}
                    onClick={openFuelPriceIndexForm}
                >
                    <Flex alignContent="flex-start">
                        <Icon name="edit" mr={2} />
                        {t("common.rename")}
                    </Flex>
                </Button>
                {isFuelPriceIndexFormModal && (
                    <FuelPriceIndexFormModal
                        fuelPriceIndex={fuelPriceIndex}
                        onClose={closeFuelPriceIndexFormModal}
                        onSubmit={onUpdate}
                    />
                )}

                {fuelPriceIndex.fuel_surcharge_agreements.length === 0 && (
                    <Button
                        justifyContent="flex-start"
                        variant="plain"
                        color={`${theme.colors.grey.dark} !important`}
                        onClick={onDelete}
                        withConfirmation
                        modalProps={{
                            title: t("fuelSurcharges.deleteFuelPriceIndex"),
                            mainButton: {
                                children: t("common.delete"),
                            },
                        }}
                    >
                        <Flex alignContent="flex-start">
                            <Icon name="delete" mr={2} />
                            {t("common.delete")}
                        </Flex>
                    </Button>
                )}
            </Popover.Content>
        </Popover>
    );
};
