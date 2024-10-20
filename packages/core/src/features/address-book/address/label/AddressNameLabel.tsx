import React from "react";

import {CompanyName} from "../../company/CompanyName";

type Company = {
    name?: string;
    is_verified?: boolean;
};

type Props = {
    address?: {
        name?: string;
        company?: Company | null;
    } | null;
};
export function AddressNameLabel({address}: Props) {
    if (address) {
        const company = address.company;
        if (company) {
            const hasADifferentAddressName = address.name && company.name !== address.name;
            return (
                <b>
                    <CompanyName company={company} tooltip withoutContainer />
                    {hasADifferentAddressName && <>{" - " + address.name}</>}
                </b>
            );
        }
        if (address.name) {
            return <b>{address.name}</b>;
        }
    }
    return null;
}
