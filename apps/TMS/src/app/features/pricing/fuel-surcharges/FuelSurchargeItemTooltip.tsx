import {t} from "@dashdoc/web-core";
import {Flex, Text, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {FuelSurchargeItem, formatNumber} from "dashdoc-utils";
import React from "react";

import {FuelSurchargeAgreementWithSurchargeItems} from "app/screens/invoicing/hooks/useFuelSurchargeAgreement";

type FuelSurchargeItemTooltipProps = {
    fuelSurchargeAgreement: FuelSurchargeAgreementWithSurchargeItems;
    fuelSurchargeItem: FuelSurchargeItem;
};

const TextDot = styled(Text)`
    overflow: hidden;
    white-space: nowrap;
    color: ${theme.colors.grey.ultradark};
    &::after {
        content: " ............................................ ";
        color: ${theme.colors.grey.default};
    }
`;

export const FuelSurchargeItemTooltip: React.FC<FuelSurchargeItemTooltipProps> = ({
    fuelSurchargeAgreement,
    fuelSurchargeItem,
}) => {
    const fuelPrice = formatNumber(fuelSurchargeItem.fuel_price, {maximumFractionDigits: 4});
    const agreementReferencePrice = formatNumber(fuelSurchargeAgreement.reference_price, {
        maximumFractionDigits: 4,
    });
    const variationFormula = `(${fuelPrice} / ${agreementReferencePrice} - 1) x 100`;
    const variation =
        parseFloat(fuelSurchargeItem.fuel_price) / fuelSurchargeAgreement.reference_price - 1;

    return (
        <Flex flexDirection="column" width="30rem" style={{rowGap: "8px"}}>
            <Text variant="h1">{t("fuelSurcharges.detailCalcul")}</Text>
            <Flex justifyContent="space-between">
                <Flex flexDirection="column">
                    <TextDot>{t("fuelSurcharges.variationIndex")}</TextDot>
                    <Text color="grey.dark" variant="caption">
                        {variationFormula}
                    </Text>
                </Flex>
                <Text>
                    {formatNumber(variation, {
                        style: "percent",
                        maximumFractionDigits: 2,
                    })}
                </Text>
            </Flex>
            <Flex justifyContent="space-between">
                <Flex style={{columnGap: "4px"}}>
                    <Text color="grey.dark">{"x"}</Text>
                    <TextDot>{t("fuelSurcharges.fuelPart")}</TextDot>
                </Flex>
                <Flex style={{columnGap: "4px"}}>
                    <Text color="grey.dark">{"x"}</Text>
                    <Text>
                        {formatNumber(fuelSurchargeAgreement.fuel_part / 100, {
                            style: "percent",
                            maximumFractionDigits: 2,
                        })}
                    </Text>
                </Flex>
            </Flex>
            <Flex
                borderTop="1px solid"
                borderTopColor="grey.light"
                justifyContent="end"
                my="2"
                py="2"
            >
                <Text variant="h1">
                    {formatNumber(+fuelSurchargeItem.computed_rate / 100, {
                        style: "percent",
                        maximumFractionDigits: 2,
                    })}
                </Text>
            </Flex>
        </Flex>
    );
};
