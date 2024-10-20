import {getReadableAddress} from "@dashdoc/web-core";
import {Address, Company} from "dashdoc-utils";
import React from "react";
import Highlighter from "react-highlight-words";

import {EditAddressPopover} from "app/features/address/EditAddressPopover";
import {PartnersScreenQuery} from "app/features/address-book/companies/types";

import {useUpdateCompany} from "./hooks/useUpdateCompany";

type Props = {
    company: Company;
    address: Address;
    currentQuery: PartnersScreenQuery;
};

export function AddressCell({company, address, currentQuery}: Props) {
    const {onDeleteAddress, onSaveAddress} = useUpdateCompany(currentQuery);
    const searchedTexts: string[] = currentQuery.text ?? [];
    return (
        <EditAddressPopover
            key={address.pk}
            address={{
                ...address,
                company: {pk: company.pk, name: company.name},
            }}
            onSave={onSaveAddress}
            onDelete={onDeleteAddress}
        >
            <Highlighter
                autoEscape={true}
                searchWords={searchedTexts}
                textToHighlight={getReadableAddress(address)}
            />
        </EditAddressPopover>
    );
}
