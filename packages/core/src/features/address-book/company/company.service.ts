import {Company} from "dashdoc-utils";

import type {PartnerDetailOutput, PartnerInListOutput} from "../../../types/partnerTypes";

/**
 * Check if a company is allowed to create companies in the webapp.
 * This behavior is related to block_shipper_creation company feature.
 */
function canCreateCompany(ownCompany: Company | null | undefined) {
    let canCreate = true;
    if (!ownCompany || ownCompany?.settings?.block_shipper_creation) {
        canCreate = false;
    }
    return canCreate;
}

function isCompanyInfoFilled(company: Company | null) {
    if (!company) {
        return false;
    }

    const address = company.primary_address;

    if (!address) {
        return false;
    }

    return [company.name, address.postcode, address.city, address.country, address.address].every(
        (str) => str.trim()
    );
}

/**
 * We have an uniq path for partner link ${baseUrl}/address-book/partners/${company.pk}/.
 * The entry point should not depend on the company status (shipper, carrier, shipper&carrier).
 **/
function getPartnerLink(
    baseUrl: string,
    company:
        | Pick<Company, "pk">
        | Pick<PartnerDetailOutput, "pk">
        | Pick<PartnerInListOutput, "pk">
        | number
) {
    const companyId = typeof company === "object" ? company.pk : company;
    return `${baseUrl}/address-book/partners/${companyId}/`;
}

function isShipper(company: Company | PartnerDetailOutput) {
    // TODO: Clean me when removing the FF betterCompanyRoles
    if ("is_shipper" in company) {
        // Using a PartnerDetailOutput
        return company.is_shipper;
    }
    // Using a Company
    const role = company.settings?.default_role;
    if (role) {
        return role && ["shipper", "carrier_and_shipper"].includes(role);
    }
    return company.addresses?.some((address) => address.is_shipper) ?? false;
}

function isCarrier(company: Company | PartnerDetailOutput) {
    // TODO: Clean me when removing the FF betterCompanyRoles
    if ("is_carrier" in company) {
        // Using a PartnerDetailOutput
        return company.is_carrier;
    }
    // Using a Company
    const role = company.settings?.default_role;
    if (role) {
        return role && ["carrier", "carrier_and_shipper"].includes(role);
    }
    return company.addresses?.some((address) => address.is_carrier) ?? false;
}

export function getDefaultCurrency(company: Company | null) {
    return company?.settings?.default_currency ?? "EUR";
}

export function getAdministrativeAddress(company: Company | PartnerDetailOutput) {
    // TODO: Remove me when removing the FF betterCompanyRoles
    return "administrative_address" in company
        ? company.administrative_address
        : company.primary_address;
}

export const companyService = {
    canCreateCompany,
    getPartnerLink,
    isCompanyInfoFilled,
    isShipper,
    isCarrier,
    getDefaultCurrency,
};
