import {t} from "@dashdoc/web-core";
import {Flex, Modal} from "@dashdoc/web-ui";
import {FuelPriceIndex} from "dashdoc-utils";
import {format} from "date-fns";
import React, {useState} from "react";

import {FuelPriceIndexesTable} from "app/features/pricing/fuel-surcharges/FuelPriceIndexesTable";
import {FuelSurchargeImpacts} from "app/features/pricing/fuel-surcharges/FuelSurchargeImpacts";
import {BulkUpdateFuelPriceIndex} from "app/redux/actions/fuel-surcharge/fuel-price-indexes";

export type UpdatedFuelPriceIndex = FuelPriceIndex & {
    updated_price?: number;
    application_date?: Date;
};

type FuelPriceIndexesUpdateFormModalProps = {
    onClose: () => void;
    onSubmit: (fuelPriceIndexes: BulkUpdateFuelPriceIndex[]) => void;
    fuelPriceIndexes: FuelPriceIndex[];
    isSubmitting: boolean;
    hasNextPage?: boolean;
    isLoading?: boolean;
    loadNextPage?: () => void;
};

export const FuelPriceIndexesUpdateFormModal: React.FC<FuelPriceIndexesUpdateFormModalProps> = ({
    onClose,
    onSubmit,
    fuelPriceIndexes,
    isSubmitting,
    hasNextPage = false,
    isLoading = false,
    loadNextPage = () => null,
}) => {
    const [updatedFuelPriceIndexes, setUpdatedFuelPriceIndexes] = useState<
        UpdatedFuelPriceIndex[]
    >([]);
    const [currentFuelPriceIndex, setCurrentFuelPriceIndex] =
        useState<UpdatedFuelPriceIndex | null>(null);

    const onUpdate = () => {
        onSubmit(
            updatedFuelPriceIndexes.map(
                ({uid, application_date, updated_price}: Required<UpdatedFuelPriceIndex>) => {
                    return {
                        uid,
                        updated_price,
                        application_date: format(application_date as Date, "yyyy-MM-dd"),
                    };
                }
            )
        );
    };

    const onChangeFuelPriceIndexes = (fuelPriceIndexes: UpdatedFuelPriceIndex[]) => {
        setUpdatedFuelPriceIndexes(fuelPriceIndexes);
    };

    const onSelectFuelPriceIndex = (fuelPriceIndex: UpdatedFuelPriceIndex | null) => {
        setCurrentFuelPriceIndex(fuelPriceIndex);
    };
    return (
        <Modal
            title={t("fuelSurcharges.updateFuelPriceIndexes")}
            mainButton={{
                children: t("common.update"),
                type: "submit",
                onClick: onUpdate,
                disabled: !fuelPriceIndexes.length || isSubmitting,
            }}
            secondaryButton={{
                onClick: onClose,
            }}
            onClose={onClose}
            size="xlarge"
        >
            <Flex style={{columnGap: "16px"}}>
                <Flex flex="3">
                    <FuelPriceIndexesTable
                        onChange={onChangeFuelPriceIndexes}
                        onSelect={onSelectFuelPriceIndex}
                        fuelPriceIndexes={fuelPriceIndexes}
                        hasNextPage={hasNextPage}
                        loadNextPage={loadNextPage}
                        isLoading={isLoading}
                    />
                </Flex>
                <Flex flex="1">
                    <FuelSurchargeImpacts fuelPriceIndex={currentFuelPriceIndex} />
                </Flex>
            </Flex>
        </Modal>
    );
};
