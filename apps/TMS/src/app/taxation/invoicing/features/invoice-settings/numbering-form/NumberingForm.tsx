import {t} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    DatePicker,
    Flex,
    IconNames,
    Link,
    ModeDescription,
    ModeTypeSelector,
    NumberInput,
    Select,
    TemplateArea,
    Text,
} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {formatDate} from "dashdoc-utils";
import {Form, FormikProvider, useFormik} from "formik";
import React, {useRef, useState} from "react";
import {OptionTypeBase} from "react-select";

import {InvoiceNumberPreview} from "app/taxation/invoicing/features/invoice-settings/numbering-form/InvoiceNumberPreview";
import {
    VariablesList,
    getNumberingVariablesList,
} from "app/taxation/invoicing/features/invoice-settings/numbering-form/VariablesList";
import {updateInvoiceNumberingSettings} from "app/taxation/invoicing/services/invoiceSettings";
import {InvoiceNumberingPostData} from "app/taxation/invoicing/types/invoiceSettingsTypes";

type FormProps = {
    prefix_template: string;
    reset_period: "never" | "year" | "month";
    last_invoice_number_outside_dashdoc: number | null;
    last_invoice_date_outside_dashdoc: Date | null;
    first_invoice_number: number | null;
};

interface NumberingFormProps {
    numberingData: InvoiceNumberingPostData;
    onNumberingEdit: (numberingData: InvoiceNumberingPostData) => void;
    onSubmit: () => void;
    setLoading: (loading: boolean) => void;
    readOnly?: boolean;
}

type ModeType = "continue-numbering" | "new-numbering";

export function NumberingForm({
    numberingData,
    onNumberingEdit,
    onSubmit,
    setLoading,
    readOnly = false,
}: NumberingFormProps) {
    const modeInit =
        numberingData.last_invoice_number_outside_dashdoc !== null &&
        !numberingData.last_invoice_date_outside_dashdoc
            ? "new-numbering"
            : "continue-numbering";
    const [currentMode, setCurrentMode] = useState<ModeType>(modeInit);
    const initialTemplate = numberingData.prefix_template ?? "";

    const formik = useFormik<FormProps>({
        initialValues: {
            prefix_template: initialTemplate,
            reset_period: numberingData.reset_period ? numberingData.reset_period : "never",
            last_invoice_number_outside_dashdoc:
                modeInit === "continue-numbering" &&
                numberingData.last_invoice_number_outside_dashdoc !== null
                    ? numberingData.last_invoice_number_outside_dashdoc
                    : null,
            last_invoice_date_outside_dashdoc:
                modeInit === "continue-numbering" &&
                numberingData.last_invoice_date_outside_dashdoc
                    ? new Date(numberingData.last_invoice_date_outside_dashdoc)
                    : null,
            first_invoice_number:
                modeInit === "new-numbering" &&
                numberingData.last_invoice_number_outside_dashdoc !== null
                    ? numberingData.last_invoice_number_outside_dashdoc + 1
                    : null,
        },
        onSubmit: async () => {
            setLoading(true);

            try {
                const updatedNumbering = await updateInvoiceNumberingSettings(
                    currentNumbering as InvoiceNumberingPostData
                );
                onNumberingEdit(updatedNumbering);
                onSubmit();
            } finally {
                setLoading(false);
            }
        },
        validate: (values: any) => {
            let errors: null | {
                prefix_template?: string;
                last_invoice_number_outside_dashdoc?: string;
                last_invoice_date_outside_dashdoc?: string;
                first_invoice_number?: string;
            } = {};

            if (currentMode === "continue-numbering") {
                if (values.last_invoice_number_outside_dashdoc === null) {
                    errors.last_invoice_number_outside_dashdoc = t("common.mandatoryField");
                }
                if (values.last_invoice_date_outside_dashdoc === null) {
                    errors.last_invoice_date_outside_dashdoc = t("common.mandatoryField");
                }
            }
            if (currentMode === "new-numbering") {
                if (values.first_invoice_number === null) {
                    errors.first_invoice_number = t("common.mandatoryField");
                } else if (values.first_invoice_number < 1) {
                    errors.first_invoice_number = t("companySettings.valueMustBeGreaterThanOne");
                }
            }

            if (values.reset_period === "year" && !values.prefix_template.includes("[[year]]")) {
                errors.prefix_template = t(
                    "invoiceNumberingSettings.prefixTemplateMustContainYear"
                );
            } else if (
                values.reset_period === "month" &&
                (!values.prefix_template.includes("[[year]]") ||
                    !values.prefix_template.includes("[[month]]"))
            ) {
                errors.prefix_template = t(
                    "invoiceNumberingSettings.prefixTemplateMustContainMonth"
                );
            }
            return errors;
        },
        validateOnBlur: true,
        validateOnChange: false,
    });

    const formattedDate = formik.values.last_invoice_date_outside_dashdoc
        ? formatDate(formik.values.last_invoice_date_outside_dashdoc, "yyyy-MM-dd")
        : null;

    const currentNumbering = {
        prefix_template: formik.values.prefix_template,
        reset_period: formik.values.reset_period,
        last_invoice_number_outside_dashdoc:
            currentMode === "continue-numbering"
                ? formik.values.last_invoice_number_outside_dashdoc
                : formik.values.first_invoice_number !== null
                  ? formik.values.first_invoice_number - 1
                  : null,
        last_invoice_date_outside_dashdoc:
            currentMode === "continue-numbering" ? formattedDate : null,
    };

    const reset_period_options = [
        {
            value: "never",
            label: t("invoiceNumberingSettings.neverReset"),
            description: t("invoiceNumberingSettings.neverResetDescription"),
        },
        {
            value: "year",
            label: t("invoiceNumberingSettings.yearlyReset"),
            description: t("invoiceNumberingSettings.yearlyResetDescription"),
        },
        {
            value: "month",
            label: t("invoiceNumberingSettings.monthlyReset"),
            description: t("invoiceNumberingSettings.monthlyResetDescription"),
        },
    ];

    const templateAreaRef = useRef<{
        addVariable: (variableId: string) => void;
    }>();

    const modeList: ModeDescription<ModeType>[] = [
        {
            value: "continue-numbering",
            label: t("invoiceNumberingSettings.continuePreviousNumbering"),
            icon: "continueSequence" as IconNames,
            display: true,
        },
        {
            value: "new-numbering",
            label: t("invoiceNumberingSettings.startNewNumbering"),
            icon: "new" as IconNames,
            display: true,
        },
    ];

    const [focusedComponent, setFocusedComponent] = useState<string | null>(null);

    return (
        <>
            <Text variant="h1" mb={2}>
                {t("invoiceNumberingSettings.numberingModeQuestion")}
            </Text>
            <ModeTypeSelector<ModeType>
                modeList={modeList}
                currentMode={currentMode}
                setCurrentMode={setCurrentMode}
                disabled={readOnly}
                width="170px"
            />
            <Text variant="h1" mt={5} mb={2}>
                {t("invoiceNumberingSettings.numberingFormatTitle")}
            </Text>
            <Box mb={4}>
                <Text as="span">
                    {currentMode === "continue-numbering"
                        ? t("invoiceNumberingSettings.numberingFormatDescription2") + " "
                        : t("invoiceNumberingSettings.numberingFormatDescription3") + " "}
                </Text>
                <Link
                    href="https://help.dashdoc.com/fr/articles/8279667-configurez-vos-informations-de-facturation"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {t("invoiceNumberingSettings.dedicatedArticle")}
                </Link>
            </Box>
            <FormikProvider value={formik}>
                <Form id="numbering-form" noValidate>
                    <Flex flexDirection={"row"} mb={4}>
                        <Flex width={readOnly ? "100%" : "65%"} flexDirection="column">
                            <Box
                                mb={3}
                                display={currentMode === "continue-numbering" ? "block" : "none"}
                            >
                                <DatePicker
                                    label={t("invoiceNumberingSettings.lastInvoiceDate")}
                                    onChange={(value: Date | null) => {
                                        formik.setFieldValue(
                                            "last_invoice_date_outside_dashdoc",
                                            value
                                        );
                                    }}
                                    rootId="react-app-modal-root"
                                    date={formik.values.last_invoice_date_outside_dashdoc}
                                    data-testid="numbering-settings-last-invoice-date-input"
                                    required
                                    clearable
                                    error={formik.errors.last_invoice_date_outside_dashdoc}
                                    disabled={readOnly}
                                    shortcutDates={[]}
                                />
                            </Box>
                            <Box mb={readOnly ? 3 : 4}>
                                <Flex flexDirection={"row"}>
                                    <Box width={"50%"} mr={2}>
                                        <TemplateArea
                                            // @ts-ignore
                                            ref={templateAreaRef}
                                            variableList={getNumberingVariablesList()}
                                            displayBuiltInVariablePicker={false}
                                            initialTemplate={initialTemplate}
                                            onChange={(newValue: string) => {
                                                // We remove all the blank spaces from the template
                                                newValue = newValue.replace(/\s/g, "");
                                                formik.setFieldValue("prefix_template", newValue);
                                            }}
                                            data-testid="numbering-settings-prefix-input"
                                            onFocus={() => {
                                                if (currentMode === "continue-numbering") {
                                                    setFocusedComponent("prefix-last-invoice");
                                                } else {
                                                    setFocusedComponent("prefix-next-invoice");
                                                }
                                            }}
                                            onBlur={() => setFocusedComponent(null)}
                                            disabled={readOnly}
                                            label={t("invoiceNumberingSettings.prefixLabel")}
                                            placeholder={t(
                                                "invoiceNumberingSettings.prefixPlaceholder"
                                            )}
                                            error={formik.errors.prefix_template}
                                        />
                                    </Box>
                                    <Box width="50%">
                                        {currentMode === "continue-numbering" ? (
                                            <NumberInput
                                                key={"NumberInputModeContinueNumbering"}
                                                // Counter of the last invoice
                                                label={t(
                                                    "invoiceNumberingSettings.lastInvoiceCounter"
                                                )}
                                                placeholder={t(
                                                    "invoiceNumberingSettings.lastInvoiceCounterPlaceholder"
                                                )}
                                                onChange={(value: number) => {
                                                    formik.setFieldValue(
                                                        "last_invoice_number_outside_dashdoc",
                                                        value !== null ? Math.round(value) : null
                                                    );
                                                }}
                                                onTransientChange={(value: number) => {
                                                    formik.setFieldValue(
                                                        "last_invoice_number_outside_dashdoc",
                                                        value !== null ? Math.round(value) : null
                                                    );
                                                }}
                                                onFocus={() =>
                                                    setFocusedComponent("number-last-invoice")
                                                }
                                                onBlur={() => setFocusedComponent(null)}
                                                value={
                                                    formik.values
                                                        .last_invoice_number_outside_dashdoc
                                                }
                                                textAlign={"initial"}
                                                min={0}
                                                data-testid="numbering-settings-last-invoice-number-input"
                                                required
                                                error={
                                                    formik.errors
                                                        .last_invoice_number_outside_dashdoc
                                                }
                                                disabled={readOnly}
                                            />
                                        ) : (
                                            <NumberInput
                                                key={"NumberInputModeNewNumbering"}
                                                label={t("common.counter")}
                                                placeholder={t(
                                                    "invoiceNumberingSettings.nextInvoiceCounterPlaceholder"
                                                )}
                                                onChange={(value: number) => {
                                                    formik.setFieldValue(
                                                        "first_invoice_number",
                                                        value !== null ? Math.round(value) : null
                                                    );
                                                }}
                                                onTransientChange={(value: number) => {
                                                    formik.setFieldValue(
                                                        "first_invoice_number",
                                                        value !== null ? Math.round(value) : null
                                                    );
                                                }}
                                                onFocus={() =>
                                                    setFocusedComponent("number-next-invoice")
                                                }
                                                onBlur={() => setFocusedComponent(null)}
                                                value={formik.values.first_invoice_number}
                                                textAlign={"initial"}
                                                min={0}
                                                data-testid="numbering-settings-last-invoice-number-input"
                                                required
                                                error={formik.errors.first_invoice_number}
                                                disabled={readOnly}
                                            />
                                        )}
                                    </Box>
                                </Flex>
                                {!readOnly && (
                                    <VariablesList
                                        // @ts-ignore
                                        onClick={(id: string) => {
                                            // @ts-ignore
                                            templateAreaRef.current.addVariable?.(id);
                                        }}
                                    />
                                )}
                            </Box>

                            <Box>
                                <Text variant="h1" my={1} mb={2} mt={2}>
                                    {t("invoiceNumberingSettings.resetField")}
                                </Text>
                                <Select
                                    options={reset_period_options}
                                    onChange={(option: OptionTypeBase) => {
                                        // if option is null or undefined, set reset_period to never
                                        if (!option) {
                                            formik.setFieldValue("reset_period", "never");
                                            return;
                                        }

                                        formik.setFieldValue("reset_period", option.value);
                                    }}
                                    formatOptionLabel={(option: OptionTypeBase) => {
                                        return (
                                            <Flex
                                                flexDirection={"column"}
                                                css={css`
                                                    line-height: 25px;
                                                    padding: 5px 0px;
                                                `}
                                            >
                                                <b>{option.label}</b>
                                                {option.description}
                                            </Flex>
                                        );
                                    }}
                                    value={reset_period_options.find(
                                        (option) => option.value === formik.values.reset_period
                                    )}
                                    onBlur={() => setFocusedComponent(null)}
                                    styles={{
                                        valueContainer: (provided) => ({
                                            ...provided,
                                            height: "4.5em",
                                        }),
                                    }}
                                    data-testid="numbering-settings-reset-period-select"
                                    isDisabled={readOnly}
                                />
                            </Box>
                        </Flex>
                        {!readOnly && (
                            <Flex width={"35%"} ml={6}>
                                <InvoiceNumberPreview
                                    numberingData={currentNumbering}
                                    currentMode={currentMode}
                                    focusedComponent={focusedComponent}
                                />
                            </Flex>
                        )}
                    </Flex>
                </Form>
            </FormikProvider>
            {!readOnly && (
                <Callout variant="warning" mt={3}>
                    {t("invoiceNumberingSettings.warningCallout")}
                </Callout>
            )}
        </>
    );
}
