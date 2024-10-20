import {t} from "@dashdoc/web-core";
import {Address, Company, SecurityProtocol, populateFormData} from "dashdoc-utils";
import {FormikContextType} from "formik";
import isEqual from "lodash.isequal";
import omit from "lodash.omit";

import {apiService} from "../../../../services/api.service";
import {urlService} from "../../../../services/url.service";
import {NO_COMPANY_VALUE} from "../../company/constants";
import {fillAddressTypes} from "../address.service";

import {AddressForm} from "./types";

import type {AddressType} from "../types";

function isOriginOrDestination(formik: FormikContextType<Partial<AddressForm>>) {
    return formik.values.addressTypes?.some((addressType) => {
        if (addressType.value && ["is_origin", "is_destination"].includes(addressType.value)) {
            return true;
        }
        return false;
    });
}

function shouldShowGPSCoordsBlock(
    formik: FormikContextType<Partial<AddressForm>>,
    originalAddress?: Address | Partial<Omit<Address, "pk">>
) {
    if (!isOriginOrDestination(formik)) {
        return false;
    } else if (!originalAddress) {
        // Case we're creating an address
        return true;
    } else if (!originalAddress.coords_validated) {
        return true;
    }
    let oldAddressValues = {
        address: formik.initialValues.address,
        postcode: formik.initialValues.postcode,
        city: formik.initialValues.city,
        country: formik.initialValues.country,
    };

    let newAddressValues = {
        address: formik.values.address,
        postcode: formik.values.postcode,
        city: formik.values.city,
        country: formik.values.country,
    };

    return !isEqual(oldAddressValues, newAddressValues);
}

async function createSecurityProtocol(securityProtocolValues: {
    address: string;
    document: File;
    document_title: string;
}) {
    const formData = populateFormData(securityProtocolValues);
    const securityProtocolCreated: SecurityProtocol = await apiService.SecurityProtocols.post({
        data: formData as Partial<SecurityProtocol>,
    });
    return securityProtocolCreated;
}

function fillAddress(
    address: Address | Partial<Omit<Address, "pk">> | undefined,
    addressCategory: AddressType | undefined,
    company: Company | undefined,
    connectedCompany: Company | null,
    hasBetterCompanyRolesEnabled: boolean,
    hasLogisticPointsHaveNoRoleEnabled: boolean
): Partial<AddressForm> {
    const initialAddressTypes = fillAddressTypes(
        address,
        addressCategory,
        hasBetterCompanyRolesEnabled,
        hasLogisticPointsHaveNoRoleEnabled
    );

    let userCountry: string | undefined = undefined;
    if (address && address.country) {
        userCountry = address.country;
    } else if (connectedCompany?.primary_address) {
        userCountry = connectedCompany?.primary_address.country;
    }
    let flowUrl: string | undefined = "";
    if (address && address?.flow_site) {
        flowUrl = urlService.getFlowSiteUrl(address.flow_site.slug);
    }

    return {
        address: "",
        city: "",
        postcode: "",
        country: userCountry,
        latitude: null,
        longitude: null,
        coords_validated: false,
        company: undefined,
        name: "",
        instructions: "",
        securityProtocolFile: undefined,
        flowUrl,
        addressTypes: initialAddressTypes,
        ...omit(address, "company", "is_carrier", "is_shipper", "is_destination", "is_origin"),
        ...(address?.company?.pk ? {company: address.company} : {}),
        ...((address?.company && !address.company.pk) || (address && !address.company)
            ? {
                  name: address.company?.name || address?.name,
                  company: {
                      pk: NO_COMPANY_VALUE,
                      name: `⨯ ${t("components.noPartner")}`,
                  },
              }
            : {}),
        ...(company && {company: company}),
    };
}

function validateValues(values: AddressForm) {
    let errors: any = {};
    if (!values.company || !values.company.pk) {
        errors.company = t("errors.field_cannot_be_empty");
    }
    if (values.company && values.company.pk === NO_COMPANY_VALUE && !values.name) {
        errors.name = t("errors.field_cannot_be_empty");
    }
    if (!values.postcode) {
        errors.postcode = t("errors.field_cannot_be_empty");
    }
    if (!values.city) {
        errors.city = t("errors.field_cannot_be_empty");
    }
    if (!values.country) {
        errors.country = t("errors.field_cannot_be_empty");
    }
    if (!values.addressTypes || values.addressTypes.length === 0) {
        errors.addressTypes = t("errors.at_least_one_of_carrier");
    }
    if (values.flowUrl && !urlService.isValidFlowSiteUrl(values.flowUrl)) {
        errors.flowUrl = t("tmsIntegration.flowBookingLink.invalidLink");
    }

    return errors;
}

export const addressFormService = {
    isOriginOrDestination,
    shouldShowGPSCoordsBlock,
    createSecurityProtocol,
    fillAddress,
    validateValues,
};
