import {t} from "@dashdoc/web-core";
import {
    Box,
    FiltersSelectOption,
    Flex,
    Select,
    SelectCountry,
    SelectOptions,
    Text,
} from "@dashdoc/web-ui";
import {Address, Company} from "dashdoc-utils";
import {Field, FormikContextType} from "formik";
import React from "react";

import {useFeatureFlag} from "../../../../../hooks/useFeatureFlag";
import {companyService} from "../../../company/company.service";
import {NO_COMPANY_VALUE} from "../../../company/constants";
import {getAddressTypeLabel} from "../../address.service";
import {PlaceAutocompleteInputWithFormik} from "../../PlaceAutocompleteInput";
import {getAllAddressTypes, type AddressTypesOptions} from "../../types";
import {addressFormService} from "../addressForm.service";
import {AddressForm} from "../types";
type Props = {
    originalAddress?: Address | Partial<Omit<Address, "pk">>;
    formik: FormikContextType<Partial<AddressForm>>;
    connectedCompany: Company | null;
    disabled?: boolean;
};

export function LocationSection({formik, originalAddress, connectedCompany, disabled}: Props) {
    const shouldShowGPSCoordsBlock = addressFormService.shouldShowGPSCoordsBlock(
        formik,
        originalAddress
    );
    const canCreateCompany = companyService.canCreateCompany(connectedCompany);
    const hasBetterCompanyRolesEnabled = useFeatureFlag("betterCompanyRoles");
    const hasLogisticPointsHaveNoRoleEnabled = useFeatureFlag("logisticPointsHaveNoRole");

    const companyValue = formik.values.company;
    const noCompany = !companyValue || companyValue.pk === NO_COMPANY_VALUE;
    const addressTypeOptions: SelectOptions = getAllAddressTypes(hasBetterCompanyRolesEnabled)
        .filter((address_type) => {
            if (
                ["is_carrier", "is_shipper"].includes(address_type) &&
                (!canCreateCompany || noCompany)
            ) {
                return false;
            }
            return true;
        })
        .map((address_type) => ({
            label: getAddressTypeLabel(address_type),
            value: address_type,
        }));

    return (
        <>
            <Text variant="h1" mb={4} mt={4}>
                {t("common.location")}
            </Text>
            <Flex justifyContent="space-between" mb={2}>
                <Box flexBasis="100%">
                    <Field
                        component={PlaceAutocompleteInputWithFormik}
                        name="address"
                        label={t("common.address")}
                        placeholder={t("common.address")}
                        data-testid="address-modal-address"
                        complementaryDataAutocomplete={{
                            postcode: formik.values.postcode,
                            city: formik.values.city,
                        }}
                        error={formik.errors.address}
                        disabled={disabled}
                    />
                </Box>
            </Flex>
            <Flex justifyContent="space-between" mb={2}>
                <Box flexBasis="20%">
                    <Field
                        component={PlaceAutocompleteInputWithFormik}
                        name="postcode"
                        label={t("common.postalCode")}
                        required
                        placeholder={t("common.postalCode")}
                        data-testid="address-modal-postcode"
                        complementaryDataAutocomplete={{
                            address: formik.values.address,
                            city: formik.values.city,
                        }}
                        customOnChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            formik.setFieldError("postcode", undefined);
                            formik.setFieldValue("postcode", event.target.value);
                        }}
                        error={formik.errors.postcode}
                        disabled={disabled}
                    />
                </Box>
                <Box flexBasis="48%">
                    <Field
                        component={PlaceAutocompleteInputWithFormik}
                        name="city"
                        label={t("common.city")}
                        required
                        placeholder={t("common.city")}
                        data-testid="address-modal-city"
                        complementaryDataAutocomplete={{
                            address: formik.values.address,
                            postcode: formik.values.postcode,
                        }}
                        customOnChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            formik.setFieldError("city", undefined);
                            formik.setFieldValue("city", event.target.value);
                        }}
                        error={formik.errors.city}
                        disabled={disabled}
                    />
                </Box>
                <Box flexBasis="30%" height="40px">
                    <Field
                        name="country"
                        placeHolder={t("common.country")}
                        component={SelectCountry}
                        label={t("common.country")}
                        onChange={(country: string) => {
                            formik.setFieldValue("country", country);
                        }}
                        value={formik.values.country}
                        data-testid="address-modal-country"
                        error={formik.errors.country}
                        disabled={disabled}
                    />
                </Box>
            </Flex>
            {!hasLogisticPointsHaveNoRoleEnabled && (
                <Flex mb={2}>
                    <Box flexBasis="100%">
                        <Field
                            component={Select}
                            name="addressTypes"
                            isMulti
                            isSearchable={false}
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            components={{
                                Option: FiltersSelectOption,
                            }}
                            value={formik.values.addressTypes}
                            onChange={(values: AddressTypesOptions) => {
                                formik.setFieldError("addressTypes", undefined);
                                formik.setFieldValue("addressTypes", values);
                            }}
                            label={t("addressModal.addressType")}
                            placeholder={t("addressModal.addressTypePlaceholder")}
                            options={addressTypeOptions}
                            data-testid="address-modal-address-types"
                            error={
                                formik.errors.addressTypes
                                    ? String(formik.errors.addressTypes)
                                    : false
                            }
                            required
                            disabled={disabled}
                        />
                    </Box>
                </Flex>
            )}
            {shouldShowGPSCoordsBlock && (
                <Text mt={4} color="grey.dark" variant="caption">
                    {t("addressModal.siteAddressCoordinatesInfo")}
                </Text>
            )}
        </>
    );
}
