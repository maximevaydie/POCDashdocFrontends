import {t} from "@dashdoc/web-core";
import {Badge, Flex, Text} from "@dashdoc/web-ui";
import {formatDate, formatNumber} from "dashdoc-utils";
import React from "react";

import {FuelSurchargeImpactData} from "app/features/pricing/fuel-surcharges/FuelSurchargeImpacts";
import {fuelSurchargeService} from "app/features/pricing/fuel-surcharges/services/fuelSurcharge.service";

type FuelSurchargeImpactProps = {
    fuelSurchargeImpact: FuelSurchargeImpactData;
};

export const FuelSurchargeImpact: React.FC<FuelSurchargeImpactProps> = ({fuelSurchargeImpact}) => {
    const {fuel_surcharge_agreement, fuel_surcharge_item} = fuelSurchargeImpact;

    return (
        <Flex
            p="4"
            flexDirection="column"
            bg="white"
            style={{rowGap: "6px"}}
            border="1px solid"
            borderColor="grey.light"
            borderRadius="2"
            boxShadow="small"
        >
            <Text variant="h1">{fuel_surcharge_agreement.name}</Text>
            <Text>
                {t("fuelSurcharges.applicationDate")}
                <span>
                    {t("common.colon")}
                    {formatDate(fuel_surcharge_item.start_date, "dd/MM/yyyy")}
                </span>
            </Text>
            <Badge
                alignSelf="end"
                shape="squared"
                variant={fuelSurchargeService.getFuelSurchargeBadgeVariant(
                    +fuel_surcharge_item.computed_rate
                )}
            >
                <Text
                    variant="h1"
                    color={fuelSurchargeService.getFuelSurchargeImpactBadgeColor(
                        +fuel_surcharge_item.computed_rate
                    )}
                >
                    {formatNumber(+fuel_surcharge_item.computed_rate / 100, {
                        style: "percent",
                        maximumFractionDigits: 2,
                    })}
                </Text>
            </Badge>
        </Flex>
    );
};
