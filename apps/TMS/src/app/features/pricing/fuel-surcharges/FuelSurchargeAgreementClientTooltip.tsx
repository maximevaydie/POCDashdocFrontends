import {t} from "@dashdoc/web-core";
import {Flex, Text} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import React from "react";

type FuelSurchargeAgreementClientTooltipProps = {
    clients: Company[];
};

export const FuelSurchargeAgreementClientTooltip: React.FC<
    FuelSurchargeAgreementClientTooltipProps
> = ({clients}) => {
    return (
        <Flex flexDirection="column" width="30rem" style={{rowGap: "8px"}}>
            <Text variant="h1" borderBottom="1px solid" py="1" borderColor="grey.light">
                {t("common.clients")}
            </Text>
            <ul style={{paddingLeft: "16px"}}>
                {clients.map(({name}, index: number) => {
                    return <li key={index}>{name}</li>;
                })}
            </ul>
        </Flex>
    );
};
