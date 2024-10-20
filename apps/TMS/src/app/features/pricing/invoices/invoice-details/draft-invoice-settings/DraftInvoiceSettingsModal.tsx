import {getErrorMessagesFromServerError, useDispatch} from "@dashdoc/web-common";
import {Logger, SUPPORTED_LOCALES_OPTIONS, SupportedLocale, t} from "@dashdoc/web-core";
import {Box, Callout, Flex, Modal, Radio, SwitchInput, Text} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import React from "react";
import {Controller, FormProvider, useForm, UseFormReturn} from "react-hook-form";
import {z} from "zod";

import {InvoiceDescriptionTemplatePicker} from "app/features/pricing/invoices/invoice-details/draft-invoice-settings/InvoiceDescriptionTemplatePicker";
import {InvoiceLanguagePicker} from "app/features/pricing/invoices/invoice-details/draft-invoice-settings/InvoiceLanguagePicker";
import {InvoiceMultiRibPicker} from "app/features/pricing/invoices/invoice-details/draft-invoice-settings/InvoiceMultiRibPicker";
import {useInvoiceContext} from "app/features/pricing/invoices/invoice-details/invoice-content/contexts/InvoiceOrCreditNoteContext";
import {fetchUpdateInvoice, UpdateInvoicePayload} from "app/redux/actions";
import {useInvoiceBankInformation} from "app/taxation/invoicing/hooks/useInvoiceBankInformation";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

type Props = {
    defaultValue?: {name: string};
    onClose: () => void;
};

export function DraftInvoiceSettingsModal({onClose}: Props) {
    const dispatch = useDispatch();
    const {invoice} = useInvoiceContext();
    const form = useForm<FormType>({
        defaultValues: getDefaultValues(invoice),
        resolver: zodResolver(schema),
    });
    const loading = form.formState.isLoading || form.formState.isSubmitting;
    const disabled = loading;

    return (
        <Modal
            title={t("draftInvoiceSettingsModal.title", {debtorName: invoice.debtor.name})}
            data-testid="draft-invoice-settings-modal"
            onClose={handleClose}
            mainButton={{
                children: t("common.save"),
                onClick: form.handleSubmit(handleSubmit),
                loading,
                disabled,
                "data-testid": "main-button",
            }}
            secondaryButton={{
                children: t("common.cancel"),
                disabled,
                "data-testid": "secondary-button",
            }}
            size="medium"
        >
            <Form form={form} />
        </Modal>
    );

    async function handleSubmit(values: FormType) {
        try {
            let payload: UpdateInvoicePayload = {
                language: values.language.value as SupportedLocale,
            };
            if (!invoice.is_bare_invoice) {
                payload = {
                    ...payload,
                    template_uid: values.descriptionTemplate.value,
                    fuel_surcharge_in_footer: values.fuelSurcharge === "onFooter",
                    show_carbon_footprint: values.showCarbonFootprint,
                };
            }
            if (values.bankInformation) {
                payload = {...payload, bank_information_uid: values.bankInformation.value};
            }

            await dispatch(fetchUpdateInvoice(invoice.uid, payload));
            onClose();
        } catch (error) {
            const errorMessage = await getErrorMessagesFromServerError(error);
            if (errorMessage && typeof errorMessage === "string") {
                form.setError("root", {type: "onSubmit", message: errorMessage});
            } else {
                Logger.error("Error during submit", error);
                form.setError("root", {type: "onSubmit", message: t("common.error")});
            }
        }
    }

    function handleClose() {
        if (loading) {
            return;
        }
        onClose();
    }
}

const schema = z.object({
    descriptionTemplate: z.object({
        value: z.string().nullable(),
        testId: z.string(),
        label: z.string(),
    }),
    bankInformation: z
        .object({
            value: z.string(),
            testId: z.string(),
            label: z.string(),
        })
        .nullable(),
    language: z.object({
        value: z.string(),
        testId: z.string(),
        label: z.string(),
    }),
    fuelSurcharge: z.enum(["perTransport", "onFooter"]),
    showCarbonFootprint: z.boolean(),
});

type FormType = z.infer<typeof schema>;

function getDefaultValues(invoice: Invoice): FormType {
    return {
        descriptionTemplate: invoice.description_template
            ? {
                  value: invoice.description_template.uid,
                  label: invoice.description_template.name,
                  testId: `select-option-${invoice.description_template.name}`,
              }
            : {
                  value: null,
                  testId: "select-option-default",
                  label: t("invoice.DefaultTemplate"),
              },
        bankInformation: invoice.bank_information && {
            value: invoice.bank_information.uid,
            label: invoice.bank_information.name,
            testId: `select-option-${invoice.bank_information.name}`,
        },
        language: {
            value: invoice.language,
            testId: `select-option-${invoice.language}`,
            label:
                SUPPORTED_LOCALES_OPTIONS.find((option) => option.value === invoice.language)
                    ?.label ?? "",
        },
        fuelSurcharge: invoice.fuel_surcharge_in_footer ? "onFooter" : "perTransport",
        showCarbonFootprint: invoice.show_carbon_footprint ?? true,
    };
}

type FormProps = {
    form: UseFormReturn<FormType>;
};

function Form({form}: FormProps) {
    const {invoice} = useInvoiceContext();
    const {bankInformationList} = useInvoiceBankInformation();
    return (
        <FormProvider {...form}>
            <Callout mb={4}>{t("draftInvoiceSettingsModal.callout")}</Callout>
            {!invoice.is_bare_invoice && (
                <Box mb={5}>
                    <Text variant="h1" fontSize={3} mb={2}>
                        {t("invoice.descriptionTemplate")}
                    </Text>
                    <Text>{t("draftInvoiceSettingsModal.descriptionTemplateDescription")}</Text>
                    <Box mt={3}>
                        <Controller
                            name="descriptionTemplate"
                            render={({field}) => <InvoiceDescriptionTemplatePicker {...field} />}
                        />
                    </Box>
                </Box>
            )}
            {invoice.is_dashdoc && bankInformationList.length > 0 && (
                <Box mb={5}>
                    <Text variant="h1" fontSize={3} mb={2}>
                        {t("invoice.bankDetails")}
                    </Text>
                    <Box mt={3}>
                        <Controller
                            name="bankInformation"
                            render={({field}) => (
                                <InvoiceMultiRibPicker
                                    {...field}
                                    bankInformationList={bankInformationList}
                                />
                            )}
                        />
                    </Box>
                </Box>
            )}
            {invoice.is_dashdoc && (
                <Box mb={5}>
                    <Text variant="h1" fontSize={3} mb={2}>
                        {t("draftInvoiceSettingsModal.pdfLanguage")}
                    </Text>
                    <Box mt={3}>
                        <Controller
                            name="language"
                            render={({field}) => <InvoiceLanguagePicker {...field} />}
                        />
                    </Box>
                </Box>
            )}
            {invoice.is_dashdoc && !invoice.is_bare_invoice && (
                <Box mb={5}>
                    <Text variant="h1" fontSize={3} mb={3}>
                        {t("components.gasIndex")}
                    </Text>
                    <Controller
                        name="fuelSurcharge"
                        render={({field: {value, onChange}}) => (
                            <Flex flexDirection={"column"}>
                                <Radio
                                    label={t("draftInvoiceSettingsModal.oneLinePerTransport")}
                                    value={"perTransport"}
                                    data-testid="fuel-surcharge-per-transport"
                                    onChange={() => onChange("perTransport")}
                                    checked={value === "perTransport"}
                                />
                                <Radio
                                    label={t("draftInvoiceSettingsModal.oneLineOnFooter")}
                                    data-testid="fuel-surcharge-on-footer"
                                    value={"onFooter"}
                                    onChange={() => onChange("onFooter")}
                                    checked={value === "onFooter"}
                                />
                            </Flex>
                        )}
                    />
                </Box>
            )}
            {invoice.is_dashdoc && !invoice.is_bare_invoice && (
                <Box mb={5}>
                    <Text variant="h1" fontSize={3} mb={3}>
                        {t("carbonFootprint.title")}
                    </Text>
                    <Controller
                        name="showCarbonFootprint"
                        render={({field: {value, onChange}}) => (
                            <SwitchInput
                                labelRight={t("draftInvoiceSettingsModal.showCarbonFootprint")}
                                value={value}
                                onChange={(value: boolean) => onChange(value)}
                                data-testid="show-carbon-footprint"
                            />
                        )}
                    />
                </Box>
            )}
        </FormProvider>
    );
}
