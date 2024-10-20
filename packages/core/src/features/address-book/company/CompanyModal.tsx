import {t} from "@dashdoc/web-core";
import {
    Box,
    Coordinates,
    FiltersSelectOption,
    Flex,
    Modal,
    Select,
    SelectCountry,
    SelectOptions,
    Text,
    TextInput,
} from "@dashdoc/web-ui";
import {Company, yup, type Address} from "dashdoc-utils";
import {Field, FormikErrors, FormikProvider, useFormik} from "formik";
import set from "lodash.set";
import React from "react";
import {Value} from "react-phone-number-input";
import {useDispatch, useSelector} from "react-redux";

import {VAT_NUMBER_REGEX} from "../../../constants/vatNumberValidation";
import {LocalizedPhoneNumberInput} from "../../LocalizedPhoneNumberInput";
import {useFeatureFlag} from "../../../hooks/useFeatureFlag";
import {
    getConnectedCompany,
    getConnectedManager,
} from "../../../../../../react/Redux/accountSelector";
import {fetchAddCompany, fetchUpdateCompany} from "../../../redux/actions/companies";
import {getErrorMessagesFromServerError} from "../../../services/errors.service";
import {managerService} from "../../../services/manager.service";
import {getAddressTypeLabel, type AddressCategories} from "../address/address.service";
import {AddressForm} from "../address/AddressForm";
import {getAllAddressTypes, type AddressType, type AddressTypesOptions} from "../address/types";

type CompanyName = {name: string};

interface CompanyModalProps {
    company?: Company | CompanyName;
    onSave?: (values: Company) => void;
    onClose: () => void;
    hideAddressForm?: boolean;
    categories?: AddressCategories[];
}

/**
 * @deprecated to remove with betterCompanyRoles
 */
export const CompanyModal = ({
    company,
    onSave,
    onClose,
    hideAddressForm,
    categories = [],
}: CompanyModalProps) => {
    const connectedCompany = useSelector(getConnectedCompany);
    const connectedManager = useSelector(getConnectedManager);
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");
    const hasDashdocInvoicingEnabled = useFeatureFlag("dashdocInvoicing");
    const hasBetterCompanyRolesEnabled = useFeatureFlag("betterCompanyRoles");

    const dispatch = useDispatch();

    // It's only possible to edit a company if the connected company is a Dashdoc customer and
    // the edited company is not a Dashdoc customer
    const connectedCompanyIsInvited = connectedCompany?.account_type === "invited";
    const isVerified = (company as Company)?.is_verified || false;
    const canEditCompany = !isVerified && !connectedCompanyIsInvited;

    const showAddressForm = canEditAddress();
    const isAdmin = managerService.hasAtLeastAdminRole(connectedManager);

    const addressTypeOptions: SelectOptions = getAllAddressTypes(hasBetterCompanyRolesEnabled).map(
        (address_type) => ({
            label: getAddressTypeLabel(address_type),
            value: address_type,
        })
    );

    function getInitialValues(): Partial<Company> {
        const primaryAddress = getInitialPrimaryAddressValues(company);

        // Case where we don't have a given company or a given a company of type CompanyName
        if (company === undefined || !("pk" in company)) {
            return {
                email: undefined,
                phone_number: undefined,
                name: company?.name ?? "",
                siren: undefined,
                trade_number: undefined,
                vat_number: undefined,
                country: undefined,
                remote_id: undefined,
                invoicing_remote_id: undefined,
                primary_address: primaryAddress,
            };
        }

        // Case where we have a given company Company
        const fullCompanyDetails = company as Company;
        return {
            pk: fullCompanyDetails.pk,
            email: fullCompanyDetails.email,
            phone_number: fullCompanyDetails.phone_number,
            name: fullCompanyDetails.name,
            siren: fullCompanyDetails.siren,
            trade_number: fullCompanyDetails.trade_number,
            vat_number: fullCompanyDetails.vat_number,
            country: fullCompanyDetails.country,
            remote_id: fullCompanyDetails.remote_id,
            invoicing_remote_id: fullCompanyDetails.invoicing_remote_id,
            primary_address: primaryAddress,
        };
    }

    function getInitialPrimaryAddressValues(company?: Company | CompanyName): Address {
        // Case where we have a given company Company
        if (company && (company as Company).primary_address) {
            const fullCompanyDetails = company as Company;
            if (
                fullCompanyDetails.primary_address !== undefined &&
                fullCompanyDetails.primary_address !== null
            ) {
                const initialAddressTypes = addressTypeOptions.filter(
                    (addressTypeOption) =>
                        (fullCompanyDetails.primary_address as Address)[
                            addressTypeOption.value as AddressType
                        ]
                );

                return {
                    pk: fullCompanyDetails.primary_address.pk,
                    address: fullCompanyDetails.primary_address.address,
                    postcode: fullCompanyDetails.primary_address.postcode,
                    city: fullCompanyDetails.primary_address.city,
                    country: fullCompanyDetails.primary_address.country,
                    latitude: fullCompanyDetails.primary_address.latitude,
                    longitude: fullCompanyDetails.primary_address.longitude,
                    radius: fullCompanyDetails.primary_address.radius,
                    coords_validated: fullCompanyDetails.primary_address.coords_validated,
                    addressTypes: initialAddressTypes,
                    company: {pk: fullCompanyDetails.pk},
                } as any as Address;
            }
        }

        // Other cases: we don't have a given company or a given a company of type CompanyName or the given company doesn't have a primary address
        const initialAddressTypes = categories.reduce<SelectOptions>((acc, category) => {
            const addressTypeOption = addressTypeOptions.find(
                (addressTypeOption) => addressTypeOption.value === `is_${category}`
            );
            if (addressTypeOption) {
                acc.push(addressTypeOption);
            }

            return acc;
        }, []);
        return {
            pk: undefined,
            address: undefined,
            postcode: undefined,
            city: undefined,
            country: connectedCompany?.country,
            latitude: undefined,
            longitude: undefined,
            radius: undefined,
            coords_validated: false,
            addressTypes: initialAddressTypes,
            company: undefined,
        } as any as Address;
    }

    const formik = useFormik({
        initialValues: getInitialValues(),
        validateOnChange: true,
        validateOnBlur: true,
        validationSchema: getValidationSchema(),
        validate: validateValues,
        onSubmit: handleSubmit,
    });

    return (
        <FormikProvider value={formik}>
            <Modal
                size="large"
                title={
                    company && (company as Company).pk
                        ? t("components.editCompany", {
                              company: company.name,
                          })
                        : t("components.addPartner")
                }
                id="company-modal"
                data-testid="company-modal"
                onClose={onClose}
                mainButton={{
                    disabled: formik.isSubmitting,
                    loading: formik.isSubmitting,
                    onClick: () => formik.submitForm(),
                    "data-testid": "company-modal-save",
                    children: t("common.save"),
                }}
                secondaryButton={{
                    disabled: formik.isSubmitting,
                    "data-testid": "company-modal-cancel-button",
                }}
            >
                <AddressForm
                    canEditCompany={canEditCompany}
                    showAddressForm={showAddressForm}
                    updateCoordinates={updateCoordinates}
                    displayRemoteId={isAdmin}
                />
                <Text variant="h1" mt={4} mb={2}>
                    {t("common.administrativeNumbers")}
                </Text>

                <Text variant="h2" mb={2}>
                    {t("common.general")}
                </Text>
                <Flex style={{gap: 16}}>
                    <Box flex={1}>
                        <TextInput
                            name="vat_number"
                            value={formik.values.vat_number ?? ""}
                            onChange={(value: string) => {
                                formik.setFieldValue("vat_number", value);
                            }}
                            error={formik.errors.vat_number}
                            label={t("components.VATNumber")}
                            disabled={!canEditCompany}
                            data-testid="company-modal-vat-number"
                        />
                    </Box>
                    <Box flex={1}>
                        <TextInput
                            name="trade_number"
                            value={formik.values.trade_number ?? ""}
                            onChange={(value: string) => {
                                formik.setFieldValue("trade_number", value);
                            }}
                            error={formik.errors.trade_number}
                            label={t("components.tradeNumber")}
                            disabled={!canEditCompany}
                            data-testid="company-modal-trade-number"
                        />
                    </Box>
                    {hasInvoiceEntityEnabled && !hasDashdocInvoicingEnabled && (
                        <Box ml={2} flex={1}>
                            <TextInput
                                name="invoicing_remote_id"
                                value={formik.values.invoicing_remote_id ?? ""}
                                onChange={(value: string) => {
                                    formik.setFieldValue("invoicing_remote_id", value);
                                }}
                                error={formik.errors.invoicing_remote_id}
                                label={t("components.invoicingRemoteId")}
                                data-testid="company-modal-invoicing-remote-id"
                            />
                        </Box>
                    )}
                </Flex>
                <Text variant="h1" mt={4} mb={2}>
                    {t("common.generalContact")}
                </Text>
                <Flex style={{gap: 16}}>
                    <Box flex={1}>
                        <TextInput
                            name="email"
                            value={formik.values.email ?? ""}
                            onChange={(value: string) => {
                                formik.setFieldValue("email", value);
                            }}
                            error={formik.errors.email}
                            label={t("common.email")}
                            disabled={!canEditCompany}
                            data-testid="company-modal-email"
                        />
                    </Box>
                    <Box flex={1}>
                        <LocalizedPhoneNumberInput
                            data-testid="company-modal-phone-number"
                            value={(formik.values.phone_number ?? "") as Value}
                            onChange={(phoneNumber: Value) =>
                                formik.setFieldValue("phone_number", phoneNumber)
                            }
                            error={formik.errors.phone_number}
                            disabled={!canEditCompany}
                            country={(company as Company)?.country ?? connectedCompany?.country}
                        />
                    </Box>
                </Flex>

                <Text variant="h1" mt={4} mb={2}>
                    {t("addressModal.addressType")}
                </Text>

                {!showAddressForm && (
                    <Box>
                        <Field
                            name="country"
                            placeHolder={t("common.country")}
                            component={SelectCountry}
                            error={formik.errors.country}
                            label={t("common.country")}
                            required
                            onChange={(country: string) =>
                                formik.setFieldValue("country", country)
                            }
                            value={formik.values.country}
                            isDisabled={!canEditCompany}
                            data-testid="company-modal-country"
                        />
                    </Box>
                )}
                <Flex>
                    <Box flexBasis="100%">
                        <Field
                            component={Select}
                            name="primary_address.addressTypes"
                            isMulti
                            isSearchable={false}
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            components={{
                                Option: FiltersSelectOption,
                            }}
                            value={
                                formik.values.primary_address &&
                                "addressTypes" in formik.values.primary_address
                                    ? formik.values.primary_address.addressTypes
                                    : undefined
                            }
                            onChange={(values: AddressTypesOptions) => {
                                formik.setFieldError("primary_address.addressTypes", undefined);
                                formik.setFieldValue("primary_address.addressTypes", values);
                            }}
                            label={t("addressModal.addressType")}
                            placeholder={t("addressModal.addressTypePlaceholder")}
                            options={addressTypeOptions}
                            data-testid="company-modal-address-types"
                            error={
                                (
                                    formik.errors.primary_address as
                                        | (Address & {addressTypes: AddressTypesOptions})
                                        | null
                                        | undefined
                                )?.addressTypes
                            }
                            required
                        />
                    </Box>
                </Flex>
            </Modal>
        </FormikProvider>
    );

    function handleSubmit(values: Partial<Company>) {
        const addressTypes = getAllAddressTypes(hasBetterCompanyRolesEnabled).reduce(
            (acc, addressType) => {
                if (values.primary_address && "addressTypes" in values.primary_address) {
                    acc[addressType] =
                        (values.primary_address.addressTypes as AddressTypesOptions)
                            ?.map((option) => option.value)
                            .includes(addressType) ?? false;
                }
                return acc;
            },
            {} as Record<AddressType, boolean>
        );

        const primary_address = values.primary_address
            ? {
                  ...values.primary_address,
                  ...addressTypes,
              }
            : null;
        if (primary_address && "addressTypes" in primary_address) {
            delete primary_address.addressTypes;
        }

        if (values && values.pk) {
            // If the company is verified (= is a Dashdoc customer)
            // Then only the "remote_id" and the "invoicing_remote_id" can be edited so we should only send those two values
            // Set address types in address before submitting

            const payload = isVerified
                ? {remote_id: values.remote_id, invoicing_remote_id: values.invoicing_remote_id}
                : {
                      name: values.name,
                      email: values.email,
                      phone_number: values.phone_number,
                      vat_number: values.vat_number,
                      trade_number: values.trade_number,
                      country: values.country || values.primary_address?.country,
                      primary_address: primary_address,
                      remote_id: values.remote_id,
                      invoicing_remote_id: values.invoicing_remote_id,
                  };

            fetchUpdateCompany(
                values.pk,
                payload
            )(dispatch).then(
                (response: any) => {
                    onSave?.(response);
                    formik.setSubmitting(false);
                },
                (error: any) => {
                    getErrorMessagesFromServerError(error).then(formik.setErrors);
                    formik.setSubmitting(false);
                }
            );
        } else {
            fetchAddCompany({
                ...values,
                country: values.country || values.primary_address?.country,
                primary_address: canEditAddress() ? primary_address : undefined,
            })(dispatch).then(
                (newCompany: Company) => {
                    // The backend creates the address as viewed by
                    // the requesting company. No need to create it here
                    newCompany.addresses?.map((address) => {
                        address.company = {pk: newCompany.pk, name: newCompany.name};
                    });
                    onSave?.(newCompany);
                    formik.setSubmitting(false);
                },
                (error: any) => {
                    getErrorMessagesFromServerError(error).then(formik.setErrors);
                    formik.setSubmitting(false);
                }
            );
        }
        formik.setSubmitting(false);
    }

    function getValidationSchema() {
        // If the company is verified (= is a Dashdoc customer)
        // Then we don't have to validate any fields as only the "remote_id" and the "invoicing_remote_id" can be edited
        if (!canEditCompany) {
            return null;
        }

        let schema: any = {
            name: yup.string().required(t("common.mandatoryField")),
            trade_number: yup.string(),
            vat_number: yup.string().matches(VAT_NUMBER_REGEX, t("common.invalidVatNumber")),
            email: yup.string().email().nullable(true),
            phone_number: yup.string().phone(t("common.invalidPhoneNumber")).nullable(true),
            primary_address: yup.object().shape({
                address: yup.string(),
                postcode: yup.string().required(t("common.mandatoryField")),
                city: yup.string().required(t("common.mandatoryField")),
                country: yup.string().required(t("common.mandatoryField")),
                addressTypes: yup.array().min(1, t("common.mandatoryField")),
            }),
        };

        if (!showAddressForm) {
            delete schema.primary_address;
            schema = {
                ...schema,
                country: yup.string().required(t("common.mandatoryField")),
            };
        }

        return yup.object().shape(schema);
    }

    function validateValues(values: Partial<Company>) {
        let errors: FormikErrors<Partial<Company>> = {};

        // If the company is verified (= is a Dashdoc customer)
        // Then we don't have to validate any fields as only the "remote_id" and the "invoicing_remote_id" can be edited
        if (!isVerified && showAddressForm) {
            if (!values.primary_address || !values.primary_address?.postcode) {
                set(errors, "primary_address.postcode", t("errors.field_cannot_be_empty"));
            }
            if (!values.primary_address || !values.primary_address?.city) {
                set(errors, "primary_address.city", t("errors.field_cannot_be_empty"));
            }
            if (!values.primary_address || !values.primary_address?.country) {
                set(errors, "primary_address.country", t("errors.field_cannot_be_empty"));
            }
            if (
                !values.primary_address ||
                !("addressTypes" in values.primary_address) ||
                ("addressTypes" in values.primary_address &&
                    !values.primary_address.addressTypes) ||
                (values.primary_address.addressTypes &&
                    (values.primary_address.addressTypes as AddressTypesOptions).length === 0)
            ) {
                set(errors, "primary_address.addressTypes", t("errors.at_least_one_of_carrier"));
            }
        } else {
            if (
                !values.primary_address ||
                !("addressTypes" in values.primary_address) ||
                (values.primary_address.addressTypes &&
                    (values.primary_address.addressTypes as AddressTypesOptions).length === 0)
            ) {
                set(errors, "primary_address.addressTypes", t("errors.at_least_one_of_carrier"));
            }
        }
        return errors;
    }

    function canEditAddress() {
        const isCreation = !("pk" in (company ?? {}));
        const canInviteTo = (company as Company)?.can_invite_to ?? false;
        return !hideAddressForm && (isCreation || canInviteTo);
    }

    function updateCoordinates(coordinates: Coordinates) {
        formik.setFieldValue("primary_address.latitude", coordinates.latitude);
        formik.setFieldValue("primary_address.longitude", coordinates.longitude);
        formik.setFieldValue("primary_address.coords_validated", true);
    }
};
