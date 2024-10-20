import {Box, CompanyAvatar, Flex, Text} from "@dashdoc/web-ui";
import {Address} from "dashdoc-utils";
import {AvailableCompany} from "features/company/SelectCompanyForm";
import React from "react";

type Props = {
    availableCompany: AvailableCompany;
};

export function CompanyFound({availableCompany}: Props) {
    const {primary_address} = availableCompany;
    return (
        <Flex>
            <Flex alignItems="center">
                <Box width="40px" height="40px" minWidth="auto" flexShrink={2}>
                    <CompanyAvatar name={availableCompany.name} />
                </Box>
                <Box ml={4}>
                    <Text variant="h1" whiteSpace="nowrap">
                        {availableCompany.name}
                    </Text>
                    <AddressSection address={primary_address} />
                </Box>
            </Flex>
            <Box></Box>
        </Flex>
    );
}

function AddressSection({address}: {address: Address | null}) {
    if (address) {
        const {address: addressLine, city, country, postcode} = address;
        const cityAndCountry = `${postcode} ${city} (${country})`;
        return (
            <>
                <Text whiteSpace="nowrap">{addressLine}</Text>
                <Text whiteSpace="nowrap">{cityAndCountry}</Text>
            </>
        );
    }
    return null;
}
