import {t} from "@dashdoc/web-core";
import {Box, Flex, TextInput, SelectOption} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import {Field, FormikContextType} from "formik";
import React from "react";

import {CompanyCreatableSelect, type CompanyCategory} from "../../../company/CompanySelect";
import {NO_COMPANY_VALUE} from "../../../company/constants";
import {AddressForm} from "../types";

type Props = {
    formik: FormikContextType<Partial<AddressForm>>;
    noCompanyOption: boolean;
    companyCategory?: CompanyCategory;

    disabled?: boolean;
};

export function CompanySection({formik, noCompanyOption, companyCategory, disabled}: Props) {
    return (
        <>
            <Flex justifyContent="space-between" mb={2}>
                <Box data-testid="address-modal-company" flexBasis="49%">
                    <Field
                        name="company"
                        component={CompanyCreatableSelect}
                        onChange={handleCompanyChange}
                        value={formik.values.company}
                        noCompanyOption={noCompanyOption}
                        companyCategory={companyCategory}
                        label={t("common.partner")}
                        error={formik.errors.company as string}
                        isDisabled={disabled}
                        required
                        hideAddressForm
                    />
                </Box>
                {!!formik.values.company?.pk && (
                    <Box flexBasis="50%">
                        <TextInput
                            name="name"
                            placeholder={t("common.name")}
                            label={t("common.name")}
                            data-testid="address-modal-name"
                            value={formik.values.name ?? ""}
                            onChange={(value) => {
                                formik.setFieldError("name", undefined);
                                formik.setFieldValue("name", value);
                            }}
                            error={formik.errors.name}
                            disabled={disabled}
                            required
                        />
                    </Box>
                )}
            </Flex>
            {formik.values.company && (
                <Flex justifyContent="space-between" mb={2}>
                    <Box flexBasis="49%">
                        <TextInput
                            name="remoteId"
                            placeholder={t("components.remoteId")}
                            label={t("components.remoteId")}
                            data-testid="address-modal-remote-id"
                            onChange={() => {}}
                            value={formik.values.company.remote_id ?? ""}
                            disabled
                        />
                    </Box>
                    <Box flexBasis="50%">
                        <TextInput
                            name="tradeNumber"
                            placeholder={t("components.tradeNumber")}
                            label={t("components.tradeNumber")}
                            data-testid="address-modal-trade-number"
                            onChange={() => {}}
                            value={formik.values.company.trade_number ?? ""}
                            disabled
                        />
                    </Box>
                </Flex>
            )}
        </>
    );

    function handleCompanyChange(company: SelectOption<string> & Company) {
        formik.setFieldError("company", undefined);

        // Creation case: set address name to company name or empty string
        // Edition case: let the address name if it's different to the company name otherwise use company name or empty string
        const companyName = company?.pk !== NO_COMPANY_VALUE ? company?.name : "";
        const addressName =
            !!formik.values?.name && formik.values?.name !== formik.values.company?.name
                ? formik.values.name
                : companyName;

        formik.setFieldValue("name", addressName);
        if (company) {
            formik.setFieldValue("company.pk", company?.pk);
            formik.setFieldValue("company.name", company?.name);
            formik.setFieldValue("company.remote_id", company?.remote_id || "");
            formik.setFieldValue("company.trade_number", company?.trade_number || "");
        } else {
            formik.setFieldValue("company", null);
        }
        if (!company || company.pk === NO_COMPANY_VALUE) {
            const filteredAddressTypes = formik.values.addressTypes?.filter((addressType) => {
                if (addressType.value) {
                    return !["is_shipper", "is_carrier"].includes(addressType.value);
                }
                return true;
            });
            formik.setFieldValue("addressTypes", filteredAddressTypes);
        }
    }
}
