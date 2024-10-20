import {t} from "@dashdoc/web-core";
import {Box, Checkbox, Flex, ModeTypeSelector, Text} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {ExportedItemsTypeSelector} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/ExportedItemsTypeSelector";
import {
    INVOICE_EXPORT_FORM_ID,
    MAX_INVOICE_DOCUMENTS_TO_EXPORT,
} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/invoiceExport.service";
import {InvoiceExportItemsCounters} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/InvoiceExportModal";
import {
    InvoiceExportElement,
    InvoiceExportListType,
    InvoiceExportOpenedFrom,
} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/types";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";

type Props = {
    onSubmit: (
        listType: InvoiceExportListType,
        exportElement: InvoiceExportElement
    ) => Promise<void>;
    itemsCounters: InvoiceExportItemsCounters;
    openedFrom: InvoiceExportOpenedFrom;
};

export function DocumentsExportForm({onSubmit, itemsCounters, openedFrom}: Props) {
    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();

    const [exportElement, setExportElement] = useState<InvoiceExportElement>(openedFrom);
    const [listType, setListType] = useState<InvoiceExportListType>(
        itemsCounters.selected.creditNotes || itemsCounters.selected.invoices
            ? "selected"
            : "filtered"
    );

    return (
        <form onSubmit={handleSubmit} id={INVOICE_EXPORT_FORM_ID}>
            <Flex
                flexDirection={"column"}
                p={4}
                flex={1}
                style={{
                    overflow: "scroll",
                }}
                backgroundColor="grey.white"
                border="1px solid"
                borderColor={"grey.light"}
                borderRadius={1}
            >
                <Text variant="h1" color="grey.dark" mb={3}>
                    {t("invoiceExportModal.exportDocuments")}
                </Text>
                {hasDashdocInvoicingEnabled && (
                    <>
                        <ModeTypeSelector<InvoiceExportElement>
                            modeList={[
                                {
                                    value: "invoice",
                                    label: t("common.invoices"),
                                    icon: "accountingInvoice",
                                },
                                {
                                    value: "credit_note",
                                    label: t("invoiceExportModal.creditNotes"),
                                    icon: "invoice",
                                },
                                {
                                    value: "all",
                                    label: t("invoiceExportModal.InvoicesAndCreditNotes"),
                                    icon: "accountingCalculator",
                                },
                            ]}
                            currentMode={exportElement}
                            setCurrentMode={(mode: InvoiceExportElement) => {
                                if (listType === "selected" && mode !== exportElement) {
                                    setExportElement(mode);
                                    setListType("filtered");
                                } else {
                                    setExportElement(mode);
                                }
                            }}
                        />
                        <Box mt={4} />
                    </>
                )}
                <ExportedItemsTypeSelector
                    listType={listType}
                    setListType={setListType}
                    itemsCounters={itemsCounters}
                    exportElement={exportElement}
                    maxItemsToExport={MAX_INVOICE_DOCUMENTS_TO_EXPORT}
                    openedFrom={openedFrom}
                />
                <Text variant="h1" color="grey.dark" mt={4} mb={3}>
                    {t("invoiceExportModal.documentsTypeToExport")}
                </Text>
                <Checkbox
                    disabled={true}
                    label={t("invoiceExportModal.documentsExport.invoicePdf")}
                    checked={true}
                />
                <Box mt={7} />
            </Flex>
        </form>
    );

    async function handleSubmit(event: React.SyntheticEvent<EventTarget>) {
        event.preventDefault();
        await onSubmit(listType, exportElement);
    }
}
