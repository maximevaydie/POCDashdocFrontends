import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Text} from "@dashdoc/web-ui";
import React from "react";

import {FuelSurchargeAgreementExplanationItem} from "app/features/pricing/fuel-surcharges/FuelSurchargeAgreementExplanationItem";
import {
    ActiveFieldValues,
    ActiveField,
} from "app/features/pricing/fuel-surcharges/modals/FuelSurchargeAgreementFormModal";
import {fuelSurchargeService} from "app/features/pricing/fuel-surcharges/services/fuelSurcharge.service";

const bracket = (
    <svg viewBox="0 0 318 27" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M1.09864 2.3521C1.02506 9.7389 4.71563 13.0319 11.65 14.6119C25.1285 17.6829 38.7484 17.6264 52.5261 17.7636C71.2937 17.9506 89.9896 17.3526 108.727 17.5393C118.02 17.6319 127.313 17.7244 136.606 17.817C139.994 17.8507 143.781 18.4718 146.778 20.0966C148.883 21.2383 150.303 22.9922 151.833 24.242C152.331 24.6485 152.2 26.7622 152.21 25.8141C152.221 24.717 152.658 23.9079 153.456 23.1255C157.499 19.1628 165.233 18.5213 170.502 17.5447C181.118 15.5773 191.925 14.6647 202.689 13.9445C233.812 11.8621 264.974 14.3907 296.085 14.7006C305.51 14.7945 312.634 10.5826 316.343 1.57148"
            stroke="#C4CDD5"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
    </svg>
);

type FuelSurchargeAgreementExplanationProps = {
    activeField: ActiveField;
};

export const FuelSurchargeAgreementExplanation: React.FC<
    FuelSurchargeAgreementExplanationProps
> = ({activeField}) => {
    const {title, icon, description} = fuelSurchargeService.getActiveFieldExplanation(activeField);

    return (
        <Flex flexDirection="column" width="100%" style={{rowGap: "16px"}} ml="4">
            <Flex height="120px" flexDirection="column" style={{rowGap: "4px"}}>
                <Flex alignItems="center" style={{columnGap: "8px"}}>
                    <Icon color="blue.default" name={icon} scale={1.2} />
                    <Text variant="h1">{title}</Text>
                </Flex>
                <Text>{description}</Text>
            </Flex>
            <Flex
                width="100%"
                bg="grey.ultralight"
                style={{rowGap: "16px"}}
                p="4"
                border="1px solid"
                borderColor="grey.light"
                borderRadius="5px"
                flexDirection="column"
            >
                <Text variant="h1" color="grey.dark" mb="3">
                    {t("fuelSurcharges.detailCalcul")}
                </Text>
                <Flex style={{columnGap: "12px"}}>
                    <FuelSurchargeAgreementExplanationItem
                        isActive={activeField === ActiveFieldValues.REFERENCE_PRICE}
                        iconName="businessDealHandshake"
                        title={t("fuelSurcharges.initialPrice")}
                    />
                    <FuelSurchargeAgreementExplanationItem
                        iconName="synchronize"
                        title={t("fuelSurcharges.newPrice")}
                    />
                </Flex>
                <Box>{bracket}</Box>

                <Flex flexDirection="column">
                    <FuelSurchargeAgreementExplanationItem
                        iconName="graphStats"
                        title={t("fuelSurcharges.fuelPriceVariation")}
                    />
                </Flex>
                <Text color="grey.dark" variant="h1" textAlign="center">
                    x
                </Text>
                <Flex flexDirection="column">
                    <FuelSurchargeAgreementExplanationItem
                        isActive={activeField === ActiveFieldValues.FUEL_PART}
                        title={t("fuelSurcharges.fuelPart")}
                        iconName="discount"
                    />
                </Flex>
                <Text color="grey.dark" variant="h1" textAlign="center">
                    =
                </Text>
                <Flex flexDirection="column">
                    <FuelSurchargeAgreementExplanationItem
                        isActive={activeField === ActiveFieldValues.FUEL_SURCHARGE}
                        iconName="gasIndex"
                        title={t("fuelSurcharges.fuelSurcharge")}
                    />
                </Flex>
            </Flex>
        </Flex>
    );
};
