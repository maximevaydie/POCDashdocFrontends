import {t} from "@dashdoc/web-core";
import {
    Button,
    Flex,
    LoadingWheel,
    SwitchInput,
    Text,
    TextInput,
    Box,
    Link,
    Checkbox,
    Icon,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {FullHeightMinWidthNarrowScreen} from "@dashdoc/web-ui";
import {FormikProvider, useFormik} from "formik";
import React, {FunctionComponent} from "react";
import Helmet from "react-helmet";

import {
    AccountingInvoiceLinePolicy,
    useAccountingSettings,
    DEFAULT_VAT_ACCOUNT_CODE,
} from "app/taxation/invoicing/hooks/accountingSettingsHook";
import {formatTaxCode} from "app/taxation/invoicing/services/formatTaxRate";
import {useDashdocTaxCodes} from "app/taxation/invoicing/services/invoiceItemCatalogApiHooks";

type AccountingSettingForm = {
    sales_journal_code: string;
    account_code_details: Record<
        string,
        {account_code: string; country: string; tax_rate: string; dashdoc_id: string}
    >;
    invoice_line_policy: AccountingInvoiceLinePolicy;
    prevent_accounting_export_if_missing_account_code: boolean;
    export_pdf_files: boolean;
};

//Take the same props as the Box component
type BoxProps = Parameters<typeof Box>[0];
const RightArrow = (props: BoxProps) => (
    <Box {...props}>
        <svg
            width="50"
            height="24"
            viewBox="0 0 50 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M49.0607 13.0607C49.6464 12.4749 49.6464 11.5251 49.0607 10.9393L39.5147 1.3934C38.9289 0.807615 37.9792 0.807615 37.3934 1.3934C36.8076 1.97919 36.8076 2.92894 37.3934 3.51472L45.8787 12L37.3934 20.4853C36.8076 21.0711 36.8076 22.0208 37.3934 22.6066C37.9792 23.1924 38.9289 23.1924 39.5147 22.6066L49.0607 13.0607ZM-1.31134e-07 13.5L48 13.5L48 10.5L1.31134e-07 10.5L-1.31134e-07 13.5Z"
                fill="#C4CDD5"
            />
        </svg>
    </Box>
);

export const AccountingSettingsScreen: FunctionComponent = () => {
    const {accountingSettings, updateSettings, loading} = useAccountingSettings();
    const {taxCodes, loading: taxCodeLoading} = useDashdocTaxCodes();
    const [displayAllVATaccountCodes, setDisplayAllVATaccountCodes] = React.useState(false);
    const initialAccountCodeDetails: AccountingSettingForm["account_code_details"] =
        accountingSettings && !taxCodeLoading
            ? taxCodes.reduce((acc: AccountingSettingForm["account_code_details"], taxCode) => {
                  acc[taxCode.dashdoc_id] = {
                      account_code:
                          accountingSettings.account_code_details[taxCode.dashdoc_id] ??
                          DEFAULT_VAT_ACCOUNT_CODE,
                      ...taxCode,
                  };
                  return acc;
              }, {})
            : {};

    const formik = useFormik<AccountingSettingForm>({
        initialValues: accountingSettings
            ? {
                  ...accountingSettings,
                  account_code_details: initialAccountCodeDetails,
              }
            : {
                  sales_journal_code: "",
                  account_code_details: {},
                  invoice_line_policy: "detailed",
                  prevent_accounting_export_if_missing_account_code: false,
                  export_pdf_files: true,
              },
        enableReinitialize: true,
        onSubmit: (value: AccountingSettingForm) => {
            const account_code_details: Record<string, string> = {};
            Object.keys(value.account_code_details).forEach((key) => {
                account_code_details[key] = value.account_code_details[key].account_code;
            });
            updateSettings({...value, account_code_details: account_code_details});
        },
        validateOnBlur: false,
        validateOnChange: false,
    });

    return (
        <FullHeightMinWidthNarrowScreen>
            <Flex justifyContent="space-between" mb={3}>
                <Helmet>
                    <title>{t("settings.accountingSettings")}</title>
                </Helmet>
                <Text
                    as="h3"
                    variant="title"
                    display="inline-block"
                    data-testid="accounting-settings-screen-title"
                >
                    {t("settings.accountingSettingsTitle")}
                </Text>
            </Flex>
            <Text marginBottom={6}>{t("settings.accountingSettingsSummary")}</Text>
            {accountingSettings === undefined ? (
                <LoadingWheel />
            ) : (
                <FormikProvider value={formik}>
                    <Flex flexDirection={"column"} justifyContent={"flex-start"}>
                        <Flex flexDirection={"column"} style={{gap: 12}}>
                            <Text variant={"h1"} marginBottom={2}>
                                {t("settings.accounting.exportFormat")}
                            </Text>
                            <Text variant={"h2"}>
                                {t("settings.accounting.includedDocuments")}
                            </Text>
                            <Text>
                                {t("settings.accounting.defaultIncludedFiles")}
                                <TooltipWrapper
                                    boxProps={{display: "inline"}}
                                    content={
                                        <Flex maxWidth={"400px"}>
                                            {t("settings.accounting.cegidFileDescription")}
                                        </Flex>
                                    }
                                >
                                    <Icon name="questionCircle" color="blue.default" ml={1} />
                                </TooltipWrapper>
                            </Text>
                            <Checkbox
                                label={t("settings.accounting.includePDFInvoices")}
                                data-testid="include_PDF"
                                onChange={(value) => {
                                    formik.setFieldValue("export_pdf_files", value);
                                }}
                                checked={formik.values.export_pdf_files}
                            />
                            <Text variant={"h2"}>{t("settings.accounting.lineMerging")}</Text>
                            <SwitchInput
                                value={formik.values.invoice_line_policy === "by_account_code"}
                                data-testid="invoice-line-policy-switch"
                                onChange={(value) =>
                                    formik.setFieldValue(
                                        "invoice_line_policy",
                                        value ? "by_account_code" : "detailed"
                                    )
                                }
                                labelRight={t("settings.accounting.mergeInvoiceLines")}
                            />
                            <Text variant={"h1"} marginBottom={2} marginTop={4}>
                                {t("settings.accounting.exportOption")}
                            </Text>
                            <SwitchInput
                                value={
                                    formik.values.prevent_accounting_export_if_missing_account_code
                                }
                                data-testid="prevent-accounting-export-if-missing-account-code"
                                onChange={(value) =>
                                    formik.setFieldValue(
                                        "prevent_accounting_export_if_missing_account_code",
                                        value
                                    )
                                }
                                labelRight={t(
                                    "settings.accounting.preventAccountingExportIfMissingAccountCode"
                                )}
                            />
                            <Text variant={"h1"} marginTop={4}>
                                {t("settings.accounting.salesJournalCode")}
                            </Text>
                            <Text marginBottom={2}>
                                {t("settings.accounting.salesJournalCodeHelper")}
                            </Text>
                            <TextInput
                                width={250}
                                label={t("settings.accounting.salesJournalCode")}
                                name="sales_journal_code"
                                value={formik.values.sales_journal_code}
                                data-testid="sales-journal-code"
                                onChange={(value: string) =>
                                    formik.setFieldValue("sales_journal_code", value)
                                }
                                error={formik.errors.sales_journal_code}
                            />
                            <Text variant={"h1"} marginTop={4}>
                                {t("settings.accounting.VATAccountCode")}
                            </Text>
                            <Text marginBottom={2}>
                                {t("settings.accounting.VATAccountCodeHelper")}
                            </Text>

                            {taxCodeLoading ? (
                                <LoadingWheel />
                            ) : (
                                Object.keys(formik.values.account_code_details).map(
                                    (key, index) => {
                                        if (index >= 3 && !displayAllVATaccountCodes) {
                                            return null;
                                        }
                                        return (
                                            <Flex
                                                key={key}
                                                flexDirection={"row"}
                                                justifyContent={"start"}
                                                alignItems={"center"}
                                            >
                                                <Box width={120}>
                                                    <Text>
                                                        {formatTaxCode(
                                                            formik.values.account_code_details[key]
                                                        )}
                                                    </Text>
                                                </Box>
                                                <RightArrow
                                                    marginLeft={4}
                                                    marginRight={4}
                                                    data-testid={`right-arrow-${index}`}
                                                />
                                                <TextInput
                                                    width={250}
                                                    label={t("settings.accounting.VATAccountCode")}
                                                    name={`account_code_details.${key}.account_code`}
                                                    value={
                                                        formik.values.account_code_details[key]
                                                            .account_code
                                                    }
                                                    data-testid={`vat-account-code-${key}`}
                                                    onChange={(value: string) =>
                                                        formik.setFieldValue(
                                                            `account_code_details.${key}.account_code`,
                                                            value
                                                        )
                                                    }
                                                    error={
                                                        formik.errors.account_code_details?.[key]
                                                            ?.account_code
                                                    }
                                                />
                                            </Flex>
                                        );
                                    }
                                )
                            )}
                            {!displayAllVATaccountCodes && (
                                <Flex flexDirection={"row"} justifyContent={"start"}>
                                    {
                                        <Link
                                            data-testid="show-all-vat-account-codes-link"
                                            onClick={() =>
                                                setDisplayAllVATaccountCodes(
                                                    !displayAllVATaccountCodes
                                                )
                                            }
                                        >
                                            {t("settings.accounting.showAllVATAccountCodes")}
                                        </Link>
                                    }
                                </Flex>
                            )}
                            <Flex flexDirection={"row"} justifyContent={"end"}>
                                <Button
                                    marginTop={30}
                                    variant="primary"
                                    onClick={formik.submitForm}
                                    disabled={loading}
                                    data-testid="save-accounting-settings-button"
                                >
                                    {t("common.save")}
                                </Button>
                            </Flex>
                        </Flex>
                    </Flex>
                </FormikProvider>
            )}
        </FullHeightMinWidthNarrowScreen>
    );
};
