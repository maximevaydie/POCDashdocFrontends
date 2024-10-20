import {t} from "@dashdoc/web-core";
import {Flex, type FlexProps} from "@dashdoc/web-ui";
import React from "react";

import {AddressLabel} from "./AddressLabel";
import {AddressNameLabel} from "./AddressNameLabel";
type Company = {
    name?: string;
    is_verified?: boolean;
};

type Props = {
    address?: {
        address?: string;
        postcode?: string;
        city?: string;
        country?: string;
        name?: string;
        company?: Company | null;
    } | null;
} & FlexProps;

export function NamedAddressLabel({address, ...flexProps}: Props) {
    return (
        <Flex flexDirection="column" {...flexProps}>
            {address ? (
                <>
                    <AddressNameLabel address={address} />
                    <AddressLabel address={address} onSeveralLines />
                </>
            ) : (
                t("common.unspecified")
            )}
        </Flex>
    );
}
