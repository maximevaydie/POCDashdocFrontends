import {t} from "@dashdoc/web-core";
import React from "react";

import {NamedAddressLabel} from "../address/label/NamedAddressLabel";

import type {UpdatablePartner} from "../types";

type Props = {
    partner: UpdatablePartner;
};

export function AdministrativeAddressTextWithName({partner}: Props) {
    if (!partner) {
        return <>{t("common.unspecified")}</>;
    }
    const {address, city, country, postcode} = partner.administrative_address;
    const namedAddress = {
        address,
        city,
        country,
        postcode,
        company: {name: partner.name, is_verified: partner.is_verified},
    };
    return <NamedAddressLabel address={namedAddress} />;
}
