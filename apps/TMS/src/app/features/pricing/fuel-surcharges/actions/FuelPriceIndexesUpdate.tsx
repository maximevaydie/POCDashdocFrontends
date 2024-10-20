import {t} from "@dashdoc/web-core";
import {Button, Flex, Icon} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {Fragment} from "react";

import {FuelPriceIndexesUpdateForm} from "app/features/pricing/fuel-surcharges/FuelPriceIndexesUpdateForm";

type FuelPriceIndexesUpdateProps = {
    onOpenPanel: () => void;
    onUpdateSuccess: () => void;
};

export const FuelPriceIndexesUpdate: React.FC<FuelPriceIndexesUpdateProps> = ({
    onOpenPanel,
    onUpdateSuccess,
}) => {
    const [
        isFuelPriceIndexesUpdateForm,
        openFuelPriceIndexesUpdateForm,
        closeFuelPriceIndexesUpdateForm,
    ] = useToggle();

    return (
        <Fragment>
            <Flex ml="auto">
                <Button
                    type="button"
                    variant="secondary"
                    data-testid="update-fuel-price-index-button"
                    onClick={openFuelPriceIndexesUpdateForm}
                >
                    <Icon name="currencyDollarIncreaseMoney" mr={3} color="blue.default" />
                    {t("fuelSurcharges.updateFuelPriceIndexes")}
                </Button>
                <Button onClick={onOpenPanel} variant="secondary" position="relative" ml="-10px">
                    <Icon name="cog" />
                </Button>
            </Flex>
            {isFuelPriceIndexesUpdateForm && (
                <FuelPriceIndexesUpdateForm
                    onUpdateSuccess={onUpdateSuccess}
                    onClose={closeFuelPriceIndexesUpdateForm}
                />
            )}
        </Fragment>
    );
};
