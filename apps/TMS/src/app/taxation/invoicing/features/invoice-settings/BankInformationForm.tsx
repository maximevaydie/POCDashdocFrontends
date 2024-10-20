import {t} from "@dashdoc/web-core";
import {Box, Flex, Text, TextArea, TextInput} from "@dashdoc/web-ui";
import {FormGroup} from "@dashdoc/web-ui";
import {Form, FormikProvider, useFormik} from "formik";
import React from "react";

import {InvoiceDiagram} from "app/taxation/invoicing/features/invoice-settings/InvoiceDiagram";
import {
    patchBankInformation,
    postBankInformation,
} from "app/taxation/invoicing/services/invoiceSettings";
import {isValidIban} from "app/taxation/invoicing/services/isValidIban";
import {InvoiceBankInformation} from "app/taxation/invoicing/types/invoiceSettingsTypes";

type FormProps = {
    name: string;
    bank_iban: string;
    bank_bic: string;
    bank_name: string;
    payment_instructions: string;
};

interface BankInformationFormProps {
    invoiceBankInformation: InvoiceBankInformation | null;
    onSubmit: (invoiceBankInformation?: InvoiceBankInformation) => void;
    setLoading: (loading: boolean) => void;
    origin?: "settings" | "onboarding";
}

export function BankInformationForm({
    invoiceBankInformation,
    onSubmit,
    setLoading,
    origin,
}: BankInformationFormProps) {
    const formik = useFormik<FormProps>({
        initialValues: {
            name: invoiceBankInformation?.name ?? "",
            bank_iban: invoiceBankInformation?.bank_iban ?? "",
            bank_bic: invoiceBankInformation?.bank_bic ?? "",
            bank_name: invoiceBankInformation?.bank_name ?? "",
            payment_instructions: invoiceBankInformation?.payment_instructions ?? "",
        },
        onSubmit: async () => {
            // If all values are empty, we do not submit
            const noValues = Object.values(formik.values).every((value) => !value);
            if (noValues) {
                onSubmit();
                return;
            }
            setLoading(true);
            const payload = {
                name: formik.values.name,
                bank_iban: formik.values.bank_iban,
                bank_bic: formik.values.bank_bic,
                bank_name: formik.values.bank_name,
                payment_instructions: formik.values.payment_instructions,
            };
            try {
                let updatedInvoiceBankInformation;
                if (invoiceBankInformation && invoiceBankInformation.uid) {
                    updatedInvoiceBankInformation = await patchBankInformation(
                        invoiceBankInformation.uid,
                        payload as InvoiceBankInformation
                    );
                } else {
                    updatedInvoiceBankInformation = await postBankInformation(payload);
                }
                onSubmit(updatedInvoiceBankInformation);
            } finally {
                setLoading(false);
            }
        },
        validate: (values) => {
            const errors: Partial<FormProps> = {};
            const atLeastOneValueNonEmpty = Object.values(values).some((value) => value !== "");
            // Validate IBAN
            if (!isValidIban(values.bank_iban)) {
                errors.bank_iban = t("InvoicePaymentSettings.invalidIban");
            }
            // In the onboarding, bank info is optional, but if the user enters a value, name becomes mandatory
            if (!values.name && (origin !== "onboarding" || atLeastOneValueNonEmpty)) {
                errors.name = t("common.mandatoryField");
            }
            return errors;
        },
        validateOnBlur: false,
        validateOnChange: false,
    });

    return (
        <Flex flexDirection={"column"}>
            {origin === "onboarding" && (
                <Text variant="h1" mb={2}>
                    {t("InvoicePaymentSettings.titleWizard")}
                </Text>
            )}
            <Text mb={5}>{t("InvoicePaymentSettings.description")}</Text>
            <Flex flexDirection={"row"} mb={3}>
                <Box flex={1}>
                    <FormikProvider value={formik}>
                        <Form id="payment-data-form" noValidate>
                            <FormGroup>
                                <TextInput
                                    label={t("common.name")}
                                    onChange={(value: string) => {
                                        formik.setFieldValue("name", value);
                                    }}
                                    error={formik.errors.name}
                                    required={origin !== "onboarding"}
                                    value={formik.values.name}
                                    data-testid="payment-settings-name-input"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Flex flexDirection={"row"}>
                                    <Box width={"60%"} mr={1}>
                                        <TextInput
                                            label={t("InvoicePaymentSettings.iban")}
                                            onChange={(value: string) => {
                                                // Remove all characters that are not numbers or letters
                                                value = value.replace(/[^a-zA-Z0-9]/g, "");
                                                // Set the IBAN to have a space every 4 characters
                                                value = value.replace(/\s/g, "");
                                                value = value.replace(/(.{4})/g, "$1 ");
                                                value = value.trim();

                                                formik.setFieldValue("bank_iban", value);
                                            }}
                                            value={formik.values.bank_iban}
                                            error={formik.errors.bank_iban}
                                            data-testid="payment-settings-iban-input"
                                        />
                                    </Box>
                                    <Box ml={1} flex={1}>
                                        <TextInput
                                            label={t("InvoicePaymentSettings.bic")}
                                            onChange={(value: string) => {
                                                formik.setFieldValue("bank_bic", value);
                                            }}
                                            value={formik.values.bank_bic}
                                            data-testid="payment-settings-bic-input"
                                        />
                                    </Box>
                                </Flex>
                            </FormGroup>
                            <FormGroup>
                                <TextInput
                                    label={t("InvoicePaymentSettings.bankName")}
                                    onChange={(value: string) => {
                                        formik.setFieldValue("bank_name", value);
                                    }}
                                    value={formik.values.bank_name}
                                    data-testid="payment-settings-bank-name-input"
                                />
                            </FormGroup>
                            <FormGroup>
                                <TextArea
                                    label={t("InvoicePaymentSettings.paymentInstructions")}
                                    onChange={(value: string) => {
                                        formik.setFieldValue("payment_instructions", value);
                                    }}
                                    value={formik.values.payment_instructions}
                                    data-testid="payment-settings-payment-instructions-input"
                                />
                            </FormGroup>
                        </Form>
                    </FormikProvider>
                </Box>
                <InvoiceDiagram highlight="payment-data" />
            </Flex>
        </Flex>
    );
}
