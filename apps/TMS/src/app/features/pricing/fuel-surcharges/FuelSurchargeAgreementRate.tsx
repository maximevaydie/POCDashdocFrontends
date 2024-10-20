import {Logger, t} from "@dashdoc/web-core";
import {Badge, Button, Flex, Text} from "@dashdoc/web-ui";
import {formatNumber, useToggle} from "dashdoc-utils";
import React, {useState} from "react";

import {FuelPriceIndexesUpdateFormModal} from "app/features/pricing/fuel-surcharges/modals/FuelPriceIndexesUpdateFormModal";
import {fuelSurchargeService} from "app/features/pricing/fuel-surcharges/services/fuelSurcharge.service";
import {
    fetchBulkUpdateFuelPriceIndexes,
    BulkUpdateFuelPriceIndex,
} from "app/redux/actions/fuel-surcharge/fuel-price-indexes";
import {useDispatch} from "app/redux/hooks";
import {FuelSurchargeAgreementWithSurchargeItems} from "app/screens/invoicing/hooks/useFuelSurchargeAgreement";

type FuelSurchargeAgreementRateProps = {
    fuelSurchargeAgreement: FuelSurchargeAgreementWithSurchargeItems;
    onSuccessUpdate: () => void;
};
export const FuelSurchargeAgreementRate: React.FC<FuelSurchargeAgreementRateProps> = ({
    fuelSurchargeAgreement,
    onSuccessUpdate,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {fuel_surcharge_items} = fuelSurchargeAgreement;
    const dispatch = useDispatch();
    const [
        isFuelPriceIndexUpdateFormModal,
        openFuelPriceIndexUpdateFormModal,
        closeFuelPriceIndexUpdateFormModal,
    ] = useToggle();

    const lastSurchargeItem = fuel_surcharge_items.length
        ? fuel_surcharge_items[fuel_surcharge_items.length - 1]
        : null;

    const onUpdateFuelPriceIndex = async (fuelPriceIndexes: BulkUpdateFuelPriceIndex[]) => {
        try {
            setIsSubmitting(true);
            const updateFuelPriceIndexRequest = dispatch(
                fetchBulkUpdateFuelPriceIndexes(fuelPriceIndexes)
            );
            await updateFuelPriceIndexRequest;
            onSuccessUpdate();
            closeFuelPriceIndexUpdateFormModal();
        } catch (e) {
            Logger.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Flex
            flex="1"
            bg="white"
            p="4"
            style={{rowGap: "8px"}}
            flexDirection="column"
            borderRadius="8px"
            boxShadow="medium"
        >
            <Flex style={{columnGap: "4px"}}>
                <Text variant="h1" color="grey.dark">
                    {t("fuelSurcharges.lastSurchargeRate")}
                </Text>
                <Button
                    ml="auto"
                    variant="plain"
                    style={{padding: "0 8px"}}
                    onClick={openFuelPriceIndexUpdateFormModal}
                    data-testid="fuel-surcharge-agreement-update-price-index-button"
                >
                    {t("common.update")}
                </Button>
            </Flex>
            {lastSurchargeItem && (
                <Badge
                    borderRadius="10px"
                    height="36px"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    variant={fuelSurchargeService.getFuelSurchargeBadgeVariant(
                        +lastSurchargeItem.computed_rate
                    )}
                >
                    <Text
                        variant="h1"
                        color={fuelSurchargeService.getFuelSurchargeImpactBadgeColor(
                            +lastSurchargeItem.computed_rate
                        )}
                    >
                        {formatNumber(+lastSurchargeItem.computed_rate / 100, {
                            style: "percent",
                            maximumFractionDigits: 2,
                        })}
                    </Text>
                </Badge>
            )}
            {isFuelPriceIndexUpdateFormModal && (
                <FuelPriceIndexesUpdateFormModal
                    fuelPriceIndexes={[fuelSurchargeAgreement.fuel_price_index]}
                    onClose={closeFuelPriceIndexUpdateFormModal}
                    isSubmitting={isSubmitting}
                    onSubmit={onUpdateFuelPriceIndex}
                />
            )}
        </Flex>
    );
};
