import {t} from "@dashdoc/web-core";
import {Flex, Text, TextInput} from "@dashdoc/web-ui";
import {FuelSurchargeAgreement} from "dashdoc-utils";
import React, {useState} from "react";

type FuelSurchargeAgreementNameProps = {
    onUpdate: (name: FuelSurchargeAgreement["name"]) => void;
    name: FuelSurchargeAgreement["name"];
};

export const FuelSurchargeAgreementName: React.FC<FuelSurchargeAgreementNameProps> = ({
    onUpdate,
    name,
}) => {
    const [agreementName, setAgreementName] = useState(name);

    return (
        <Flex
            flex="1"
            bg="white"
            p="4"
            flexDirection="column"
            style={{rowGap: "8px"}}
            borderRadius="8px"
            boxShadow="medium"
        >
            <Flex style={{columnGap: "4px"}}>
                <Text variant="h1" color="grey.dark">
                    {t("fuelSurcharges.nameFuelSurchargeAgreement")}
                </Text>
                <Text color="blue.default">{t("common.star")}</Text>
            </Flex>
            <TextInput
                value={agreementName}
                onChange={(value) => {
                    setAgreementName(value);
                    onUpdate(value);
                }}
                data-testid="fuel-surcharge-agreement-details-name-input"
            />
        </Flex>
    );
};
