import {PartnerLink} from "@dashdoc/web-common";
import {TransportAddress} from "dashdoc-utils";
import React from "react";

type Props = {
    address: TransportAddress;
};

export function AddressWithBadCoordinates(props: Props) {
    const text = `${props.address.name} - ${props.address.city} ${props.address.postcode}`;

    if (props.address.company?.pk) {
        return <PartnerLink pk={props.address.company.pk}>{text}</PartnerLink>;
    } else {
        return <>{text}</>;
    }
}
