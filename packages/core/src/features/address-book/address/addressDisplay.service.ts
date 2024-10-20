import {Address, OriginalAddress, TransportAddress, ExtractedNewAddress} from "dashdoc-utils";

import {AdministrativeAddressOutput} from "../../../types/partnerTypes";

/**Display the address in the correct format based on the country. */
const addressDisplay = (
    houseNumber: string | undefined,
    street: string | undefined,
    district: string | undefined,
    alpha2countryCode: string
): string => {
    if (district !== undefined && street === undefined) {
        return district;
    }
    if (street === undefined) {
        return "";
    }
    if (houseNumber === undefined) {
        return street;
    }
    //Source: https://wiki.openstreetmap.org/wiki/Name_finder/Address_format
    switch (alpha2countryCode) {
        case "fr":
        case "ca":
        case "ie":
        case "uk":
        case "us":
            return houseNumber + " " + street;
        case "lu":
            return houseNumber + ", " + street;
        case "es":
            return street + ", " + houseNumber;
        case "be":
        case "ch":
        case "de":
        case "fi":
        case "it":
        case "nl":
            return street + " " + houseNumber;
        default:
            return houseNumber + " " + street;
    }
};

function getActivityAddressLabel(
    address:
        | TransportAddress
        | Address
        | OriginalAddress
        | ExtractedNewAddress
        | AdministrativeAddressOutput
        | null,
    newLineAfterAddress: boolean = false
): string {
    if (!address) {
        return "";
    }
    const addressDetails = [address.postcode + " " + address.city, address.country].join(", ");

    const addressAndDetailsSeparator = newLineAfterAddress ? "\n" : ", ";

    return [address.address]
        .filter((l) => l)
        .concat(addressDetails)
        .join(addressAndDetailsSeparator);
}

export const addressDisplayService = {
    addressDisplay,
    getActivityAddressLabel,
};
