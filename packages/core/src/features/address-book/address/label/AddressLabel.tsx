import {t} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import React from "react";

import {addressService} from "../address.service";

type Props = {
    address?: {address?: string; postcode?: string; city?: string; country?: string} | null;
    onSeveralLines?: boolean; // old AddressText
};

/**
 * Display the address as a single line.
 * Optionally display in two lines.
 */
export function AddressLabel(props: Props) {
    if (!props.address) {
        return (
            <Box as="span" data-testid="address">
                {t("common.unspecified")}
            </Box>
        );
    }
    const {address, postcode, city, country} = props.address;
    const [addressPart, part2] = addressService.formatAddress({address, postcode, city, country});

    return (
        <Box as="span" data-testid="address">
            {addressPart && (
                <>
                    {props.onSeveralLines ? (
                        // old AddressText
                        <>
                            {addressPart}
                            <br />
                        </>
                    ) : (
                        // old AddressLabel
                        <>{`${addressPart}, `}</>
                    )}
                </>
            )}
            {part2}
        </Box>
    );
}
