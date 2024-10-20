import {
    LocalizedPhoneNumberInput,
    VAT_NUMBER_REGEX,
    fetchUpdateCompany,
    getConnectedCompany,
    getErrorMessagesFromServerError,
    useTimezone,
} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Callout,
    FileUploadInput,
    Flex,
    FormGroup,
    NumberInput,
    ScrollableTableFixedHeader,
    SelectCountry,
    Text,
    TextInput,
} from "@dashdoc/web-ui";
import {populateFormData, yup} from "dashdoc-utils";
import {Field, Form, Formik, FormikProps} from "formik";
import padStart from "lodash.padstart";
import pick from "lodash.pick";
import React, {useState} from "react";
import {Helmet} from "react-helmet";
import {Value} from "react-phone-number-input";

import {CompanyLegalFormSelect} from "app/features/settings/company-settings/CompanyLegalFormSelect";
import {useDispatch, useSelector} from "app/redux/hooks";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";
import {ManagerMeCompany} from "app/types/company";

type CompanyInfosForm = {
    name: string;
    primary_address: {
        address: string;
        postcode: string;
        city: string;
        country: string;
    };
    phone_number: string;
    trade_number: string;
    vat_number: string;
    website: string;
    email: string;
    logo: File | undefined;
    legal_form: string;
    share_capital: number;
};

export default function CompanyInfos() {
    const accountType = useSelector((state) => {
        return (getConnectedCompany(state) as ManagerMeCompany).account_type;
    });
    const canEditCompany = accountType !== "invited";

    const header = (
        <ScrollableTableFixedHeader>
            <Flex justifyContent="space-between" mb={3}>
                <Helmet title={t("settings.companyInfo")} />
                <Text
                    as="h4"
                    variant="title"
                    display="inline-block"
                    data-testid="settings-company-info"
                >
                    {t("settings.companyInfo")}
                </Text>
            </Flex>
        </ScrollableTableFixedHeader>
    );

    const [loading, setLoading] = useState(false);

    return (
        <div>
            {header}
            {!canEditCompany && (
                <Callout
                    variant="warning"
                    mb={3}
                    data-testid="settings-company-cannot-edit-callout"
                >
                    {t("companySettings.cannotEditIfNotCustomer")}
                </Callout>
            )}
            <Flex flexDirection={"column"} m={3} mt={-2} maxWidth="800px">
                <CompanyInfosForm
                    origin="settings"
                    setLoading={setLoading}
                    canEditCompany={canEditCompany}
                />
                <Flex alignItems="flex-end" flexDirection="column">
                    <Button
                        form="company-info-form"
                        type="submit"
                        justifySelf="flex-end"
                        disabled={loading || !canEditCompany}
                        data-testid="settings-company-save"
                    >
                        {t("common.save")}
                    </Button>
                </Flex>
            </Flex>
        </div>
    );
}

const CompanySettingsSectionTitle = (props: any) => <Text variant="h2" mb={2} mt={4} {...props} />;

type CompanyInfosFormProps = {
    origin: "settings" | "onboarding";
    setLoading: (loading: boolean) => void;
    onSubmit?: () => void;
    canEditCompany: boolean;
};

export function CompanyInfosForm({
    origin,
    setLoading,
    onSubmit,
    canEditCompany,
}: CompanyInfosFormProps) {
    const hasDashocInvoicingEnabled = useHasDashdocInvoicingEnabled();
    const company = useSelector((state) => {
        return getConnectedCompany(state) as ManagerMeCompany;
    });
    const [companyCountry, setCompanyCountry] = useState(company?.primary_address?.country);

    const timezone = useTimezone();
    const maxLogoSize = 500 * 1024;
    const supportedLogoFormats = [
        "image/jpg",
        "image/jpeg",
        "image/gif",
        "image/png",
        "image/webp",
    ];

    const fromSettings = origin === "settings";
    const fromOnboarding = origin === "onboarding";
    const [isFileUpdated, setIsFileUpdated] = useState(false);

    let adressFieldValidation = yup.string();
    let tradeNumberValidation = yup.string().nullable(true);
    let vatNumberValidation = yup.string().matches(VAT_NUMBER_REGEX, t("common.invalidVatNumber"));
    let legalFormValidation = yup.string().nullable(true);
    let shareCapitalValidation = yup
        .number()
        .nullable(true)
        .min(1, t("companySettings.valueMustBeGreaterThanOne"));
    if (hasDashocInvoicingEnabled) {
        adressFieldValidation = adressFieldValidation.required(t("common.mandatoryField"));
        vatNumberValidation = vatNumberValidation.required(t("common.mandatoryField"));
        if (companyCountry === "FR") {
            tradeNumberValidation = tradeNumberValidation.required(t("common.mandatoryField"));
            legalFormValidation = legalFormValidation.required(t("common.mandatoryField"));
            shareCapitalValidation = shareCapitalValidation.required(t("common.mandatoryField"));
        }
    }

    const BaseValidationSchema = yup.object().shape({
        name: yup.string().required(t("common.mandatoryField")),
        primary_address: yup
            .object()
            .shape({
                address: adressFieldValidation,
                postcode: adressFieldValidation,
                city: adressFieldValidation,
                country: yup.string().required(t("common.mandatoryField")),
            })
            .nullable(true),
        trade_number: tradeNumberValidation,
        vat_number: vatNumberValidation,
        legal_form: legalFormValidation,
        share_capital: shareCapitalValidation,
    });

    const fromSettingsValidationSchema = yup.object().shape({
        phone_number: yup.string().phone(t("common.invalidPhoneNumber")).nullable(true),
        website: yup.string().url().nullable(true),
        email: yup.string().email(t("errors.email.invalid")).nullable(true),
        logo: yup
            .mixed()
            .test(
                "fileSize",
                t("settings.invalidLogoSize", {size: maxLogoSize / 1024 + "kB"}),
                (value) => !value || !value?.size || (value && value.size <= maxLogoSize)
            )
            .test(
                "fileFormat",
                t("settings.invalidLogoFormat", {
                    formats: supportedLogoFormats.join(", "),
                }),
                (value) => !value || !value?.type || supportedLogoFormats.includes(value.type)
            ),
    });

    const companyInfosValidationSchema = fromSettings
        ? BaseValidationSchema.concat(fromSettingsValidationSchema)
        : BaseValidationSchema;

    const initialValues = {
        ...pick(company, [
            "name",
            "primary_address",
            "website",
            "email",
            "phone_number",
            "trade_number",
            "vat_number",
            "legal_form",
            "share_capital",
        ]),
        logo: company?.settings?.logo ?? undefined,
        primary_address: company?.primary_address || {country: "FR"},
    };

    const dispatch = useDispatch();

    const handleTradeNumberChange = (
        tradeNumber: string,
        setFieldValue: FormikProps<CompanyInfosForm>["setFieldValue"]
    ) => {
        setFieldValue("trade_number", tradeNumber);
        if (companyCountry !== "FR") {
            return;
        }

        // automatically fill VAT number in France
        const cleanedTradeNumber = tradeNumber.split(" ").join("");
        if (cleanedTradeNumber.length >= 9 && /^\d+$/.test(cleanedTradeNumber)) {
            const siren = cleanedTradeNumber.slice(0, 9);
            const vatKey = padStart(String((12 + 3 * (Number(siren) % 97)) % 97), 2, "0");
            const vatNumber = `FR${vatKey}${siren}`;
            setFieldValue("vat_number", vatNumber);
        }
    };

    const submit = async (
        values: CompanyInfosForm,
        formikHelpers: FormikProps<CompanyInfosForm>
    ) => {
        setLoading(true);

        let selectedValues;
        if (fromOnboarding) {
            selectedValues = pick(values, [
                "name",
                "primary_address",
                "trade_number",
                "vat_number",
                "legal_form",
                "share_capital",
            ]);
        } else if (fromSettings && !isFileUpdated) {
            const allKeysExceptLogo = Object.keys(values).filter((key) => key !== "logo");
            selectedValues = pick(values, allKeysExceptLogo);
        } else {
            selectedValues = values;
        }

        const formData = populateFormData(selectedValues);

        formData.append("country", values.primary_address?.country);

        if (company) {
            try {
                const response = await dispatch(fetchUpdateCompany(company.pk, formData));
                onSubmit?.();
                setLoading(false);
                return response;
            } catch (error) {
                getErrorMessagesFromServerError(error).then((error?: any) => {
                    if (error) {
                        formikHelpers.setErrors(error);
                    }
                });
                setLoading(false);
                return;
            }
        } else {
            Logger.error("Company not found");
            setLoading(false);
            return;
        }
    };

    return (
        <Flex flexDirection={"column"}>
            {origin === "onboarding" && (
                <>
                    <Text variant="h1">{t("settings.companyInfo")}</Text>
                    <Text>{t("companySettings.introduction")}</Text>
                </>
            )}
            <Formik
                initialValues={initialValues as CompanyInfosForm}
                validationSchema={companyInfosValidationSchema}
                validateOnBlur={true}
                validateOnChange={true}
                onSubmit={submit}
            >
                {({values, errors, touched, setFieldValue}: FormikProps<CompanyInfosForm>) => (
                    <Form id="company-info-form" noValidate>
                        <CompanySettingsSectionTitle>
                            {t("common.general")}
                        </CompanySettingsSectionTitle>
                        <FormGroup>
                            <TextInput
                                data-testid="settings-company-name"
                                label={t("settings.companyNameLabel")}
                                placeholder="Ex: Dashdoc SAS"
                                value={values.name}
                                error={touched.name && errors.name}
                                onChange={(value) => {
                                    setFieldValue("name", value);
                                }}
                                required
                                disabled={!canEditCompany}
                            />
                        </FormGroup>
                        {origin === "settings" && (
                            <>
                                <FormGroup>
                                    <Flex flexDirection="row">
                                        <Box flex={1} mr={1}>
                                            <TextInput
                                                data-testid="settings-company-email"
                                                label={t("common.email")}
                                                placeholder="Ex: contact@transports.com"
                                                value={values.email}
                                                error={errors.email}
                                                onChange={(value) => setFieldValue("email", value)}
                                                disabled={!canEditCompany}
                                            />
                                        </Box>
                                        <Box flex={1} ml={1}>
                                            <LocalizedPhoneNumberInput
                                                data-testid="settings-company-phone-number"
                                                label={t("common.phoneNumber")}
                                                value={values.phone_number as Value}
                                                onChange={(phoneNumber?: Value) =>
                                                    setFieldValue("phone_number", phoneNumber)
                                                }
                                                error={errors.phone_number}
                                                country={company?.country}
                                                disabled={!canEditCompany}
                                            />
                                        </Box>
                                    </Flex>
                                </FormGroup>
                                <FormGroup>
                                    <FileUploadInput
                                        dataTestid="settings-company-logo"
                                        onFileChange={(files) => {
                                            setFieldValue(
                                                "logo",
                                                files.length > 0 ? files[0] : "",
                                                true
                                            );
                                            if (files.length > 0) {
                                                setIsFileUpdated(true);
                                            }
                                        }}
                                        onRemoveFile={() => {
                                            setFieldValue("logo", "", true);
                                            setIsFileUpdated(true);
                                        }}
                                        label={t("settings.logo")}
                                        supportedFileFormats={supportedLogoFormats}
                                        initialPreviewSrc={initialValues.logo}
                                        error={
                                            typeof errors.logo === "string"
                                                ? errors.logo
                                                : undefined
                                        }
                                        disabled={!canEditCompany}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <TextInput
                                        data-testid="settings-company-website"
                                        label={t("common.website")}
                                        placeholder="Ex: https://dashdoc.eu"
                                        value={values.website}
                                        error={errors.website}
                                        onChange={(value) => setFieldValue("website", value)}
                                        disabled={!canEditCompany}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <TextInput
                                        disabled={true}
                                        value={timezone}
                                        label={t("settings.timezoneLabel")}
                                        onChange={() => {}}
                                    />
                                </FormGroup>
                            </>
                        )}

                        <CompanySettingsSectionTitle>
                            {t("common.address")}
                        </CompanySettingsSectionTitle>

                        <FormGroup>
                            <TextInput
                                data-testid="settings-company-address"
                                label={t("common.address")}
                                placeholder="Ex: 39 rue du Caire"
                                value={values.primary_address.address}
                                onChange={(value) =>
                                    setFieldValue("primary_address.address", value)
                                }
                                error={
                                    touched.primary_address?.address &&
                                    errors.primary_address?.address
                                }
                                required={hasDashocInvoicingEnabled}
                                disabled={!canEditCompany}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Flex flexDirection="row">
                                <Box flex={1} mr={1}>
                                    <TextInput
                                        data-testid="settings-company-postcode"
                                        label={t("common.postalCode")}
                                        placeholder="Ex: 69002"
                                        value={values.primary_address.postcode}
                                        onChange={(value) =>
                                            setFieldValue("primary_address.postcode", value)
                                        }
                                        error={
                                            touched.primary_address?.postcode &&
                                            errors.primary_address?.postcode
                                        }
                                        required={hasDashocInvoicingEnabled}
                                        disabled={!canEditCompany}
                                    />
                                </Box>
                                <Box flex={1} ml={1}>
                                    <TextInput
                                        data-testid="settings-company-city"
                                        label={t("common.city")}
                                        placeholder="Ex: Lyon"
                                        value={values.primary_address.city}
                                        onChange={(value) =>
                                            setFieldValue("primary_address.city", value)
                                        }
                                        error={
                                            touched.primary_address?.city &&
                                            errors.primary_address?.city
                                        }
                                        required={hasDashocInvoicingEnabled}
                                        disabled={!canEditCompany}
                                    />
                                </Box>
                            </Flex>
                        </FormGroup>
                        <FormGroup>
                            <Field
                                data-testid="settings-company-country"
                                label={t("common.country")}
                                component={SelectCountry}
                                value={values.primary_address.country}
                                error={
                                    touched.primary_address?.country &&
                                    errors.primary_address?.country
                                }
                                onChange={(country: string) => {
                                    setFieldValue("primary_address.country", country);
                                    setCompanyCountry(country);
                                }}
                                required
                                isDisabled={!canEditCompany}
                            />
                        </FormGroup>

                        <CompanySettingsSectionTitle>
                            {t("companySettings.companyIdentification")}
                        </CompanySettingsSectionTitle>
                        <FormGroup>
                            <Flex flexDirection="row">
                                <Box flex={1} mr={1}>
                                    <TextInput
                                        data-testid="settings-company-siret"
                                        label={t("components.tradeNumber")}
                                        placeholder="Ex: 999999999"
                                        value={values.trade_number}
                                        error={touched.trade_number && errors.trade_number}
                                        onChange={(value) =>
                                            handleTradeNumberChange(value, setFieldValue)
                                        }
                                        required={
                                            hasDashocInvoicingEnabled && companyCountry === "FR"
                                        }
                                        disabled={!canEditCompany}
                                    />
                                </Box>
                                <Box flex={1} ml={1}>
                                    <TextInput
                                        data-testid="settings-company-vat"
                                        label={t("settings.companyVATNumberLabel")}
                                        placeholder={t("settings.companyVATNumberPlaceholder")}
                                        value={values.vat_number}
                                        error={touched.vat_number && errors.vat_number}
                                        disabled={!canEditCompany || companyCountry === "FR"}
                                        onChange={(value) => setFieldValue("vat_number", value)}
                                        required={
                                            hasDashocInvoicingEnabled && companyCountry === "FR"
                                        }
                                    />
                                </Box>
                            </Flex>
                        </FormGroup>
                        {hasDashocInvoicingEnabled && (
                            <FormGroup>
                                <Flex flexDirection="row">
                                    <Box flex={1} mr={1}>
                                        <CompanyLegalFormSelect
                                            country={values.primary_address.country}
                                            rootId={
                                                origin === "onboarding"
                                                    ? "react-app-modal-root"
                                                    : "react-app"
                                            }
                                            data-testid="settings-company-legal-form"
                                            label={t("companySettings.legalStatusLabel")}
                                            placeholder={
                                                companyCountry === "FR"
                                                    ? t("companySettings.legalStatusPlaceholder")
                                                    : ""
                                            }
                                            value={values.legal_form}
                                            onChange={(value: string) =>
                                                setFieldValue("legal_form", value)
                                            }
                                            error={touched.legal_form && errors.legal_form}
                                            required={
                                                hasDashocInvoicingEnabled &&
                                                companyCountry === "FR"
                                            }
                                            disabled={!canEditCompany}
                                        />
                                    </Box>
                                    <Box flex={1} ml={1}>
                                        <NumberInput
                                            data-testid="settings-company-share-capital"
                                            label={t("companySettings.shareCapitalLabel")}
                                            placeholder={t(
                                                "companySettings.shareCapitalPlaceholder"
                                            )}
                                            value={values.share_capital}
                                            onChange={(value) =>
                                                setFieldValue("share_capital", value ?? null)
                                            }
                                            min={0}
                                            maxDecimals={2}
                                            units="€"
                                            error={
                                                touched.share_capital
                                                    ? errors.share_capital
                                                    : undefined
                                            }
                                            required={
                                                hasDashocInvoicingEnabled &&
                                                companyCountry === "FR"
                                            }
                                            disabled={!canEditCompany}
                                        />
                                    </Box>
                                </Flex>
                            </FormGroup>
                        )}
                    </Form>
                )}
            </Formik>
        </Flex>
    );
}
