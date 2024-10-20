import {PartnerLink} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Callout, Flex, Icon, Link, LoadingWheel, Text} from "@dashdoc/web-ui";
import {formatDate, formatNumber} from "dashdoc-utils";
import React from "react";

import useSimpleFetch from "app/hooks/useSimpleFetch";
import {INVOICE_EXPORT_FORM_ID} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/invoiceExport.service";
import {
    AccountingExportInfo,
    ExportError,
} from "app/taxation/invoicing/types/accountingExportInfo";

type Props = {
    onSubmit: () => unknown;
};

const spaceSeparator = " ";

const AccountingError = ({error}: {error: ExportError}) => {
    if (error.error === "no-invoice-to-export") {
        return <Text>{t("invoices.exportToAccountingModal.noInvoiceToExport")}</Text>;
    }
    if (error.error === "exists-item-with-empty-account-code") {
        return (
            <Text data-testid="item-missing-account-code-text">
                {t("accounting.SomeItemWithEmptyAccountCode")}
                {spaceSeparator}
                <Link
                    data-testid={"go-to-invoice-items-link"}
                    onClick={() => window.open("/app/settings/invoice-item-catalog", "_blank")}
                >
                    {t("accounting.GoToInvoiceItemCatalog")}
                </Link>
            </Text>
        );
    }
    if (error.error === "exists-customer-with-empty-account-code") {
        return (
            <>
                <Text data-testid="customer-missing-account-code-text">
                    {t("accounting.SomeCustomersDontHaveAccountCodes")}
                </Text>
                <ul>
                    {error.details.map((customer) => (
                        <li key={customer.id}>
                            <PartnerLink
                                pk={customer.id}
                                data-testid={`customer-${customer.name}-missing-account-code-link`}
                            >
                                {customer.name}
                            </PartnerLink>
                        </li>
                    ))}
                </ul>
            </>
        );
    }
    return <Text>{t("common.unknownError")}</Text>;
};

export const AccountingExportForm = ({onSubmit}: Props) => {
    const url = "/invoices/check-accounting-export/";
    const {
        isLoading: accountingExportInfoIsLoading,
        hasError: error,
        data: accountingExportInfo,
    }: {
        isLoading: boolean;
        hasError: boolean;
        data: AccountingExportInfo;
    } = useSimpleFetch(url, [], "web", {} as AccountingExportInfo);

    let modalContent;
    if (accountingExportInfoIsLoading) {
        modalContent = <LoadingWheel />;
    } else if (error) {
        modalContent = <Callout variant="danger">{t("common.error")}</Callout>;
    } else if (accountingExportInfo) {
        modalContent = (
            <Flex
                flexDirection={"column"}
                p={4}
                flexGrow={1}
                style={{
                    overflow: "scroll",
                }}
                backgroundColor="grey.white"
                border="1px solid"
                borderColor={"grey.light"}
                borderRadius={1}
            >
                <Text mb={3} variant="h1" color="grey.dark">
                    {t("invoices.exportToAccountingModal.title")}
                </Text>
                <Callout mb={5}>{t("invoices.exportToAccountingModal.callout")}</Callout>
                <Text
                    mb={3}
                    variant="h1"
                    color="grey.dark"
                    data-testid={
                        accountingExportInfo.is_export_possible
                            ? "accounting-export-header"
                            : "accounting-error-header"
                    }
                >
                    {accountingExportInfo.is_export_possible
                        ? t("invoices.exportToAccountingModal.header")
                        : t("accounting.errorsHeading")}
                </Text>
                {accountingExportInfo.is_export_possible ? (
                    <Flex flexDirection="column">
                        <Text color="red.default" mb={4}>
                            {t("invoices.exportToAccounting.filterNoApplied")}
                        </Text>
                        {accountingExportInfo.last_exported_date && (
                            <Box mb={4}>
                                <Text as={"span"}>
                                    {t("invoices.exportToAccountingModal.lastExportDateText")}
                                </Text>
                                <Text
                                    as={"span"}
                                    fontWeight={"600"}
                                    data-testid="last-accounting-export-date"
                                >
                                    {" " +
                                        formatDate(accountingExportInfo.last_exported_date, "P")}
                                </Text>
                            </Box>
                        )}
                        <Flex flexDirection="row" mb={4}>
                            <Flex
                                flexDirection="row"
                                backgroundColor="grey.light"
                                alignItems={"center"}
                                p={5}
                                borderRadius={"5px"}
                            >
                                <Flex flexDirection="column">
                                    <Text variant="h2">
                                        {t("invoices.exportToAccountingModal.invoiceNumber")}
                                    </Text>
                                    <Text
                                        variant="h1"
                                        color="grey.dark"
                                        data-testid="accounting-export-start-document-number"
                                        whiteSpace="nowrap"
                                    >
                                        {accountingExportInfo.start_document_number}
                                    </Text>
                                </Flex>
                                <Text mx={6} variant="h2" color="grey.dark">
                                    {t("common.to")}
                                </Text>
                                <Flex flexDirection="column">
                                    <Text variant="h2">
                                        {t("invoices.exportToAccountingModal.invoiceNumber")}
                                    </Text>
                                    <Text
                                        variant="h1"
                                        color="grey.dark"
                                        data-testid="accounting-export-end-document-number"
                                        whiteSpace="nowrap"
                                    >
                                        {accountingExportInfo.end_document_number}
                                    </Text>
                                </Flex>
                            </Flex>
                            <Icon name="arrowRight" mx={5}></Icon>
                            <Flex
                                flexDirection={"column"}
                                backgroundColor="grey.light"
                                p={3}
                                px={5}
                                borderRadius={"5px"}
                            >
                                <Box flex={1} />
                                <Text
                                    variant="h1"
                                    color="grey.dark"
                                    data-testid="accounting-export-invoice-count"
                                    whiteSpace="nowrap"
                                >
                                    {t("common.invoicesCount", {
                                        smart_count: accountingExportInfo.invoice_count,
                                        count: formatNumber(accountingExportInfo.invoice_count),
                                    })}
                                </Text>
                                <Text
                                    variant="h1"
                                    color="grey.dark"
                                    data-testid="accounting-export-credit-note-count"
                                    whiteSpace="nowrap"
                                >
                                    {t("common.creditNotesCount", {
                                        smart_count: accountingExportInfo.credit_note_count,
                                        count: formatNumber(
                                            accountingExportInfo.credit_note_count
                                        ),
                                    })}
                                </Text>
                                <Text
                                    variant="h1"
                                    color="grey.dark"
                                    data-testid="accounting-export-total-price"
                                    whiteSpace="nowrap"
                                >
                                    {t("common.priceWithoutTaxes", {
                                        price: formatNumber(
                                            accountingExportInfo.total_price_exc_VAT,
                                            {
                                                style: "currency",
                                                currency: "EUR",
                                            }
                                        ),
                                    })}
                                </Text>
                                <Box flex={1} />
                            </Flex>
                        </Flex>
                    </Flex>
                ) : (
                    <Flex flexDirection={"column"} justifyContent={"flex-start"}>
                        {accountingExportInfo.errors.map((error, index) => (
                            <AccountingError key={index} error={error} />
                        ))}
                    </Flex>
                )}
                {accountingExportInfo.is_export_possible && (
                    <Callout variant="warning" mb={7}>
                        {t("invoices.exportToAccountingModal.warningCallout")}
                    </Callout>
                )}
            </Flex>
        );
    }

    return (
        <form onSubmit={handleSubmit} id={INVOICE_EXPORT_FORM_ID}>
            {modalContent}
        </form>
    );

    async function handleSubmit(event: React.SyntheticEvent<EventTarget>) {
        event.preventDefault();
        const canExport =
            !error && !accountingExportInfoIsLoading && accountingExportInfo.is_export_possible;

        if (canExport) {
            await onSubmit();
        }
    }
};
