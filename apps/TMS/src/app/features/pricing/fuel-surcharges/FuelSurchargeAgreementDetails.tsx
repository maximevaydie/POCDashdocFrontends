import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text} from "@dashdoc/web-ui";
import {formatDate, formatNumber} from "dashdoc-utils";
import React from "react";

import {fuelSurchargeService} from "app/features/pricing/fuel-surcharges/services/fuelSurcharge.service";
import {FuelSurchargeAgreementWithSurchargeItems} from "app/screens/invoicing/hooks/useFuelSurchargeAgreement";

type FuelSurchargeAgreementDetailsProps = {
    fuelSurchargeAgreement: FuelSurchargeAgreementWithSurchargeItems;
};

export function FuelSurchargeAgreementDetails({
    fuelSurchargeAgreement,
}: FuelSurchargeAgreementDetailsProps) {
    const applicationDateType = fuelSurchargeService.getFuelSurchargeAgreementApplicationDateType(
        fuelSurchargeAgreement.application_date_type
    );

    return (
        <Flex flexDirection="column">
            <Flex mb={3}>
                <Text variant="h1">{t("common.informations")}</Text>
            </Flex>
            <Flex flexDirection="column">
                <Text variant="h2">{t("fuelSurcharges.dateTypeToUse")}</Text>
                <Flex mt={3}>
                    <Icon mr={2} name="simpleCalendar" />
                    <Text
                        color="grey.ultradark"
                        data-testid="fuel-surcharge-agreement-application-date-type"
                    >
                        {applicationDateType}
                    </Text>
                </Flex>
            </Flex>
            <Flex mt={5} flexDirection="column">
                <Text variant="h2">{t("fuelSurcharges.referenceValues")}</Text>
                <Flex mt={2} flexDirection="column">
                    <Flex>
                        <Icon mr={2} name="gasIndex" />
                        <Text
                            color="grey.ultradark"
                            data-testid="fuel-surcharge-agreement-fuel-price-index-name"
                        >
                            {fuelSurchargeAgreement.fuel_price_index.name}
                        </Text>
                    </Flex>
                    <Flex mt={3}>
                        <Icon mr={2} name="simpleCalendar" />
                        <Text
                            color="grey.ultradark"
                            data-testid="fuel-surcharge-agreement-reference-date"
                        >
                            {formatDate(fuelSurchargeAgreement.reference_date, "dd/MM/yyyy")}
                        </Text>
                    </Flex>
                    <Flex mt={3}>
                        <Icon mr={2} name="euro" />
                        <Text
                            color="grey.ultradark"
                            data-testid="fuel-surcharge-agreement-reference-price"
                        >
                            {formatNumber(fuelSurchargeAgreement.reference_price, {
                                style: "currency",
                                currency: "EUR",
                                maximumFractionDigits: 4,
                            }).replace("€", "")}
                        </Text>
                    </Flex>
                    <Flex mt={3} alignItems="center">
                        <Icon mr={2} name="discount" />
                        <Text
                            color="grey.ultradark"
                            data-testid="fuel-surcharge-agreement-transport-part"
                        >
                            {formatNumber(fuelSurchargeAgreement.fuel_part, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}{" "}
                            {"("}
                            {t("fuelSurcharges.fuelPart").toLowerCase()}
                            {")"}
                        </Text>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
}
