import {queryService, t, TranslationKeys} from "@dashdoc/web-core";
import {SelectOption, theme} from "@dashdoc/web-ui";
import {
    ActivitySiteType,
    Address,
    Company,
    GenericAddress,
    OriginalAddress,
    TransportAddress,
    type ExtractedNewAddress,
} from "dashdoc-utils";
import isEqual from "lodash.isequal";

import {apiService} from "../../../services/api.service";

import {getAllAddressTypes, type AddressType, type AddressTypesOptions} from "./types";

import type {
    ExtractedNewAddressEnriched,
    OriginalAddressEnriched,
    SearchAddressResult,
    SuggestedAddress,
} from "./input/types";
import type {SimpleAddress} from "../../../types/address";
import type {AddressWithFullCompany, TransportAddressWithCompany} from "dashdoc-utils";

interface AddressCreationMethodDisplayMap {
    [key: string]: {
        text: string;
        width: number;
        backgroundColor: string;
    };
}

function getAddressCreationMethodDisplayMap(): AddressCreationMethodDisplayMap {
    return {
        partner: {
            text: t("components.client"),
            width: 10,
            backgroundColor: theme.colors.green.default,
        },
        manager: {
            text: t("components.exploitation"),
            width: 10,
            backgroundColor: theme.colors.green.default,
        },
        trucker: {
            text: t("common.driver"),
            width: 10,
            backgroundColor: theme.colors.green.default,
        },
        api: {
            text: t("components.tms"),
            width: 10,
            backgroundColor: theme.colors.green.default,
        },
    };
}

function getAddressInviteStatusDisplayMap(): AddressCreationMethodDisplayMap {
    return {
        pending: {
            text: t("addressFilter.invitationPending"),
            width: 10,
            backgroundColor: theme.colors.green.default,
        },
        "signed-up": {
            text: t("addressFilter.invitationSignedUp"),
            width: 10,
            backgroundColor: theme.colors.green.default,
        },
        "not-invited": {
            text: t("addressFilter.invitationNotInvited"),
            width: 10,
            backgroundColor: theme.colors.green.default,
        },
    };
}

function getOriginalAddressWithoutRemoteId(
    address: GenericAddress
): Omit<GenericAddress, "remote_id"> {
    let addressWithoutRemoteId = address;
    delete addressWithoutRemoteId.remote_id;

    // Use original address pk
    if (addressWithoutRemoteId.original) {
        addressWithoutRemoteId.pk = addressWithoutRemoteId.original;
    }

    // Set nested company remote_id to undefined
    if (addressWithoutRemoteId.company) {
        addressWithoutRemoteId.company = {
            ...addressWithoutRemoteId.company,
            remote_id: undefined,
        };
    }

    return addressWithoutRemoteId;
}

/**
 * Convert an address to OriginalAddress.
 * If the initial object is a copy, returns an original objects.
 */
function convertAddressToIOriginalAddress(
    address:
        | SimpleAddress
        | Address
        | OriginalAddress
        | TransportAddress
        | AddressWithFullCompany
        | TransportAddressWithCompany
): OriginalAddress {
    const addressPk =
        "original" in address && address.original != undefined ? address.original : address.pk;

    // TODO: clean this by fixing the BaseAddress type
    let addressCompany: OriginalAddress["company"] = null;
    if ("company" in address && address.company) {
        const company = address.company as Company;
        addressCompany = {
            pk: company.pk,
            name: company.name,
            country: company.country,
            is_verified: company.is_verified ?? false,
            trade_number: company.trade_number ?? "",
            vat_number: company.vat_number ?? "",
            has_loggable_managers: company.has_loggable_managers || false,
            can_invite_to: company.can_invite_to || false,
        };
    }
    // TODO: clean this by fixing the BaseAddress type
    let created_by = -1;
    if ("created_by" in address && address.created_by) {
        created_by =
            typeof address.created_by === "number" ? address.created_by : address.created_by.pk;
    }

    let has_flow_site: boolean = false;
    if ("flow_site" in address) {
        // WHEN address is Address
        has_flow_site = address.flow_site !== null && address.flow_site !== undefined;
    } else if ("has_flow_site" in address) {
        // WHEN address is OriginalAddress
        has_flow_site = address.has_flow_site;
    }
    // ELSE has_flow_site does not make sense and stay at false for TransportAddressWithCompany when it's a shipper_address
    const name = "name" in address ? address.name : "";
    const coords_validated = "coords_validated" in address ? address.coords_validated : false;
    return {
        pk: addressPk,
        address: address.address,
        postcode: address.postcode,
        city: address.city,
        country: address.country,
        name,
        created_by,
        company: addressCompany,
        latitude: address.latitude ?? null,
        longitude: address.longitude ?? null,
        coords_validated,
        has_flow_site,
    };
}

export function getCompanyAndAddressName(address: {
    name?: string;
    company?: {name?: string} | null;
}) {
    let name = address.name;
    if (address.company && address.company.name !== name) {
        name = address.company.name + " - " + name;
    }
    return name ?? "";
}

export const getAddressShortLabel = (
    address?: {postcode: string; city: string; country: string} | null
): string => {
    if (!address) {
        return "";
    }
    return address.postcode + " " + address.city + (address.country ? ", " + address.country : "");
};

/**
 * Check if an address can be deleted.
 *
 * There is an optional `company` parameter. We can access to a part of the related `company` thanks to `address.company`,
 * but we cannot read `address.company.addresses` that is required is this service.
 * (We need to fetch the company explicitly thanks to redux to be able to read `company.addresses`)
 *
 * A company address can be deleted if :
 * - there are at least two addresses in the company itself
 * - the given address/company match (the address is related to the company)
 * - the address is not be a "primary_address" (a primary_address must not be deleted in any case)
 * An address without company can be deleted in any case (we check that there is no address.company reference to be robust)
 *
 * @return
 * - `[true]` when the given address `address` or `address/company` can be deleted
 * - `[false, TranslationKeys]` otherwise. The `TranslationKeys` explains the reason why.
 */
const canDeleteAddress = (
    address: Partial<Address | TransportAddress> | undefined,
    company?: Company
) => {
    let result: [true] | [false, TranslationKeys] = [true];
    if (address && company) {
        if (address.pk === company.primary_address?.pk) {
            result = [false, "components.addressDeletionUnavailable.primaryAddress"];
            // @ts-ignore
        } else if (address.company.pk !== company.pk) {
            result = [false, "components.addressDeletionUnavailable.noMatch"];
        } else if (company.addresses === undefined) {
            result = [false, "common.error"];
        } else if (company.addresses.length < 2) {
            result = [false, "components.addressDeletionUnavailable.atLeastOneAddress"];
        } else if (company.addresses.every((companyAddress) => address.pk !== companyAddress.pk)) {
            result = [false, "components.addressDeletionUnavailable.noMatch"];
        }
    } else if (address) {
        if (address.company) {
            // address without company
            result = [false, "common.error"];
        } // else, this is a company free address.
    } else {
        result = [false, "common.error"];
    }
    return result;
};

export type AddressCategories = "carrier" | "shipper" | "origin" | "destination";

function getAddressCategories(
    addressCategory: ActivitySiteType | "shipper" | "carrier" | "invoice"
): AddressCategories[] {
    if (addressCategory === "bulkingBreak") {
        return ["origin", "destination", "shipper", "carrier"];
    }
    if (addressCategory === "invoice") {
        return ["shipper"];
    }
    return [addressCategory];
}

export const fillAddressTypes = (
    address: Partial<Address> | undefined,
    addressCategory: AddressType | AddressType[] | undefined,
    hasBetterCompanyRolesEnabled: boolean,
    hasLogisticPointsHaveNoRoleEnabled: boolean
): AddressTypesOptions => {
    if (hasLogisticPointsHaveNoRoleEnabled) {
        return [
            {label: getAddressTypeLabel("is_origin"), value: "is_origin"},
            {label: getAddressTypeLabel("is_destination"), value: "is_destination"},
        ];
    }
    let initialAddressTypes: AddressTypesOptions = [];
    let addressTypeOption: SelectOption<AddressType>;

    getAllAddressTypes(hasBetterCompanyRolesEnabled).forEach((addressType) => {
        if (
            address?.[addressType as AddressType] ||
            addressCategory === addressType ||
            addressCategory?.includes(addressType)
        ) {
            addressTypeOption = {
                label: getAddressTypeLabel(addressType),
                value: addressType,
            };
            initialAddressTypes.push(addressTypeOption);
        }
    });
    return initialAddressTypes;
};

export const getAddressTypeLabel = (key: AddressType) => {
    switch (key) {
        case "is_carrier":
            return t("common.carrier");
        case "is_shipper":
            return t("common.shipper");
        case "is_origin":
            return t("common.pickupAddress");
        case "is_destination":
        default:
            return t("common.deliveryAddress");
    }
};

export async function searchAddresses(
    input: string,
    categories: string[],
    ordering: string, // TODO Type me correctly when FF logisticPointsHaveNoRole is removed
    suggestedAddresses: SuggestedAddress[],
    confirmationExtractedAddresses: (OriginalAddress | ExtractedNewAddress)[],
    page: number,
    hasLogisticPointsHaveNoRoleEnabled: boolean
): Promise<SearchAddressResult> {
    let options: (OriginalAddressEnriched | ExtractedNewAddressEnriched)[];
    let hasMore: boolean;

    if (hasLogisticPointsHaveNoRoleEnabled) {
        const params: {
            [key: string]: any;
        } = {
            text: input,
            // Available ordering in api: company_view__company, company_view__name, name, last_used_carrier, last_used_shipper, last_used_origin, last_used_destination
            // Other ordering query parameters will be ignored (default ordering: -updated)
            ordering,
            page,
        };
        const queryString = `?${queryService.toQueryString(params)}`;
        const response: {results: OriginalAddress[]; next: string | null} = await apiService.get(
            `/logistic-points/${queryString}`,
            {apiVersion: "web"}
        );

        options = response.results;
        hasMore = !!response.next;
    } else {
        const params: {
            [key: string]: any;
        } = {
            query: input,
            // Available ordering in api: company_view__company, company_view__name, name, last_used_carrier, last_used_shipper, last_used_origin, last_used_destination
            // Other ordering query parameters will be ignored (default ordering: -updated)
            ordering,
            page: page,
        };
        if (categories.length >= 1) {
            params["category__in"] = categories.join(",");
        }
        if (
            isEqual(categories, ["carrier"]) ||
            isEqual(categories, ["shipper"]) ||
            isEqual(categories, ["carrier", "shipper"])
        ) {
            params["company__isnull"] = false;
        }

        const queryString = `?${queryService.toQueryString(params)}`;

        const response: {results: OriginalAddress[]; next: string | null} = await apiService.get(
            `/address-book/search-addresses/${queryString}`,
            {apiVersion: "web"}
        );

        options = response.results;
        hasMore = !!response.next;
    }

    if (!input) {
        const filteredSuggestedAddresses = suggestedAddresses.filter(({address}) => {
            return !confirmationExtractedAddresses
                .map((address) => ("created_by" in address ? address.pk : null))
                .includes(address.pk);
        });
        const filteredOptions = options.filter((option: OriginalAddress) => {
            return ![
                ...confirmationExtractedAddresses,
                ...filteredSuggestedAddresses.map(({address}) => address),
            ]
                .map((address) => ("created_by" in address ? address.pk : null))
                .includes(option.pk);
        });
        options = [
            ...confirmationExtractedAddresses.map((address, index) => ({
                ...address,
                isLastExtracted: index === confirmationExtractedAddresses.length - 1,
            })),
            ...filteredSuggestedAddresses.map(({address, tooltipContent, children}, index) => ({
                ...addressService.convertAddressToIOriginalAddress(address),
                isLastSuggested: index === filteredSuggestedAddresses.length - 1,
                tooltipContent,
                children,
            })),
            ...filteredOptions,
        ];
    }
    return {
        options: options,
        hasMore,
        additional: {page: page + 1},
    };
}

function formatAddress(address: {
    address?: string;
    postcode?: string;
    city?: string;
    country?: string;
}): [string, string] {
    const part1 = address.address;
    const part2 = [[address.postcode, address.city].filter(Boolean).join(" "), address.country]
        .filter(Boolean)
        .join(", ");
    return [part1 ?? "", part2];
}

export const addressService = {
    getAddressCreationMethodDisplayMap,
    getAddressInviteStatusDisplayMap,
    getOriginalAddressWithoutRemoteId,
    canDeleteAddress,
    getAddressCategories,
    convertAddressToIOriginalAddress,
    searchAddresses,
    formatAddress,
};
