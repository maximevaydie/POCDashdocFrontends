import {SelectOptions} from "@dashdoc/web-ui";

export type AddressType = "is_carrier" | "is_shipper" | "is_destination" | "is_origin";

export function getAllAddressTypes(betterCompanyRolesEnabled: boolean): AddressType[] {
    if (betterCompanyRolesEnabled) {
        return ["is_origin", "is_destination"];
    }
    return ["is_carrier", "is_shipper", "is_destination", "is_origin"];
}

export type AddressTypesOptions = SelectOptions<AddressType>;
