import {Box} from "@dashdoc/web-ui";
import React from "react";

type SchedulerCardAddress = {
    city: string;
    postcode: string;
    country: string;
};
type Props = {
    address: SchedulerCardAddress | null;
    maxLength: number;
};
export function CardAddressText({address, maxLength}: Props) {
    if (!address) {
        // eslint-disable-next-line react/jsx-no-literals
        return <>?</>;
    }
    const city =
        address.city?.length <= maxLength
            ? address.city
            : address.city?.slice(0, maxLength - 1) + ".";
    const postcode = address.postcode?.slice(0, 2);
    const country = address.country;
    const label = `${city} (${postcode}) - ${country}`;

    return <Box as="span">{label}</Box>;
}
export function CardAddressName({
    name,
    maxLength,
}: {
    name: string | undefined;
    maxLength: number | undefined;
}) {
    if (!name) {
        return "";
    }
    const label =
        !maxLength || name.length <= maxLength ? name : name?.slice(0, maxLength - 1) + "...";

    return <Box as="span">{label}</Box>;
}
