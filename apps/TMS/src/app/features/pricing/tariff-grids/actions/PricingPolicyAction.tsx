import {t} from "@dashdoc/web-core";
import {Flex, Radio} from "@dashdoc/web-ui";
import {TariffGridPricingPolicy} from "dashdoc-utils";
import React, {FC} from "react";

import {TariffGrid} from "../types";

export const PricingPolicyAction: FC<{
    tariffGrid: TariffGrid;
    onChange: (value: TariffGridPricingPolicy) => void;
}> = ({tariffGrid, onChange}) => {
    return (
        <Flex ml={40} flexDirection="row" alignItems={"center"} style={{gap: 16}}>
            <Radio
                label={t("tariffGrids.useVariablePrice")}
                value={"multiply" as TariffGridPricingPolicy}
                data-testid="tariff-grid-pricing-policy-multiply"
                onChange={onChange}
                checked={
                    tariffGrid.pricing_policy === "multiply" || tariffGrid.pricing_policy === null
                }
            />
            <Radio
                label={t("tariffGrids.useFixedPrice")}
                data-testid="tariff-grid-pricing-policy-flat"
                value={"flat" as TariffGridPricingPolicy}
                onChange={onChange}
                checked={tariffGrid.pricing_policy === "flat"}
            />
        </Flex>
    );
};
