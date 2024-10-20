import {
    ResourceDownloader,
    apiService,
    getErrorMessagesFromServerError,
} from "@dashdoc/web-common";
import {ExportFormat, InvoiceExportFormat} from "@dashdoc/web-common/src/features/export/types";
import {Logger, queryService, t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Link, LoadingWheel, Modal, Text, toast} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import React from "react";
import cloneDeep from "rfdc/default";

import {SearchQuery} from "app/redux/reducers/searches";
import {AccountingExportForm} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/AccountingExportForm";
import {DocumentsExportForm} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/DocumentExportForm";
import {ExportCustomTabs} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/ExportCustomTabs";
import {
    INVOICE_EXPORT_FORM_ID,
    MAX_INVOICE_DOCUMENTS_TO_EXPORT,
    MAX_INVOICE_ITEMS_TO_EXPORT,
    getExportItemsTotalCount,
} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/invoiceExport.service";
import {
    InvoiceExportForm,
    CustomExportFormPayload,
} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/InvoiceExportForm";
import {InvoiceExportTabs} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/InvoiceExportTabs";
import {
    InvoiceExportElement,
    InvoiceExportListType,
    InvoiceExportPostPayload,
    SavedExport,
    SavedExportsPatchPayload,
    InvoiceExportOpenedFrom,
} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/types";
import {useInvoiceExportInfo} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/useInvoiceExportInfo";
import {invoiceApiService} from "app/taxation/invoicing/services/invoicesApi.service";

import type {InvoicesListQuery} from "app/features/filters/deprecated/utils";

type Props = {
    defaultValue?: {name: string};
    onClose: () => void;
    currentQuery: InvoicesListQuery;
    selectedInvoicesQuery: SearchQuery;
    selectedInvoicesCount: number;
    selectedCreditNotesCount: number;
    openedFrom: InvoiceExportOpenedFrom;
};

export type InvoiceExportItemsCounters = {
    all: {
        invoices: number;
        creditNotes: number;
    };
    filtered: {
        invoices: number;
        creditNotes: number;
    };
    selected: {
        invoices: number;
        creditNotes: number;
    };
};

const DEFAULT_EXPORT_TYPE = "global";

export function InvoiceExportModal({
    onClose,
    currentQuery,
    selectedInvoicesQuery,
    selectedInvoicesCount,
    selectedCreditNotesCount,
    openedFrom,
}: Props) {
    const [format, setFormat] = React.useState<ExportFormat>("invoices");
    const [loadingSubmit, setLoadingSubmit] = React.useState<boolean>(false);
    const isCustomExport = typeof format === "number";
    const [taskId, setTaskId] = React.useState<string | null>(null);

    const {
        isLoading: isLoadingExportInfo,
        hasError,
        exports,
        setExports,
        counters,
    } = useInvoiceExportInfo(currentQuery);

    const saved_invoice_exports = exports?.saved_invoice_exports;
    const oneUnsavedCustomExport = saved_invoice_exports?.some(
        (savedExport) => savedExport.name.length <= 0
    );

    const itemsCounters: InvoiceExportItemsCounters = {
        all: {
            invoices: counters?.all_invoices_count ?? 0,
            creditNotes: counters?.all_credit_notes_count ?? 0,
        },
        filtered: {
            invoices: counters?.filtered_invoices_count ?? 0,
            creditNotes: counters?.filtered_credit_notes_count ?? 0,
        },
        selected: {
            invoices: selectedInvoicesCount,
            creditNotes: selectedCreditNotesCount,
        },
    };

    let modalContent = null;
    if (isLoadingExportInfo) {
        modalContent = <LoadingWheel />;
    } else if (loadingSubmit) {
        modalContent = (
            <>
                <Text mb={2} variant="h1">
                    {t("components.waitForDownloadOrExportsTabBootstrap")}
                </Text>
            </>
        );
    } else if (hasError || !exports) {
        modalContent = <Text color="red.default">{t("common.error")}</Text>;
    } else {
        modalContent = (
            <Flex m={-5} mb={2} borderBottom="solid 1px" borderBottomColor="grey.light">
                <Flex p={4} flexDirection="column" backgroundColor="grey.white" maxWidth="340px">
                    <Text variant="h1" color="grey.dark" mb={4}>
                        {t("common.defaultExport")}
                    </Text>
                    <InvoiceExportTabs
                        currentFormat={format}
                        onClick={(format: InvoiceExportFormat) => setFormat(format)}
                    />
                    <Text variant="h1" color="grey.dark" mt={4} mb={2}>
                        {t("common.customExports")}
                    </Text>
                    {saved_invoice_exports && (
                        <>
                            <ExportCustomTabs
                                savedExports={saved_invoice_exports}
                                currentFormat={format}
                                onDelete={
                                    // disable deletion if there is on new export unsaved
                                    !oneUnsavedCustomExport ? handleDeleteCustomExport : undefined
                                }
                                onClick={(format: InvoiceExportFormat) => setFormat(format)}
                            />
                            {
                                // disable creation if there is on new export unsaved
                                !oneUnsavedCustomExport && (
                                    <Box ml={2} mt={2}>
                                        <Link
                                            onClick={handleNewCustomExport}
                                            alignItems="center"
                                            data-testid="add-new-custom-export"
                                        >
                                            <Icon fontSize={1} name="plusSign" mr={2} />
                                            {t("exportModal.addCustomExport")}
                                        </Link>
                                    </Box>
                                )
                            }
                        </>
                    )}
                </Flex>
                <Flex
                    flex={1}
                    backgroundColor="grey.ultralight"
                    flexDirection="column"
                    borderLeft="solid 1px"
                    borderLeftColor="grey.light"
                    p={4}
                    minHeight={"560px"}
                >
                    {format === "invoices" && (
                        <InvoiceExportForm
                            key={format}
                            value={{
                                name: t("invoiceExportModal.exportDefaultName"),
                                export_type: "global",
                                export_element: openedFrom,
                                export_list_type:
                                    selectedInvoicesCount || selectedCreditNotesCount
                                        ? "selected"
                                        : "filtered",
                                columns: [],
                            }}
                            onSubmit={handleCustomExportSubmit}
                            exportsList={exports}
                            itemsCounters={itemsCounters}
                            openedFrom={openedFrom}
                            withColumnSelector={false}
                        />
                    )}
                    {format === "documents" && (
                        <DocumentsExportForm
                            onSubmit={handleSubmitForDocumentsExport}
                            itemsCounters={itemsCounters}
                            openedFrom={openedFrom}
                        />
                    )}
                    {format === "accounting" && (
                        <AccountingExportForm onSubmit={OnSubmitAccountingExport} />
                    )}
                    {typeof format === "number" &&
                        exports &&
                        saved_invoice_exports &&
                        format < saved_invoice_exports.length && (
                            <InvoiceExportForm
                                key={format}
                                value={{
                                    ...saved_invoice_exports[format],
                                    export_element: openedFrom,
                                    export_list_type:
                                        selectedInvoicesCount || selectedCreditNotesCount
                                            ? "selected"
                                            : "filtered",
                                }}
                                onSubmit={handleCustomExportSubmit}
                                exportsList={exports}
                                openedFrom={openedFrom}
                                itemsCounters={itemsCounters}
                            />
                        )}
                </Flex>
            </Flex>
        );
    }

    return (
        <Modal
            title={t("invoiceExportModal.title")}
            data-testid="invoice-export-modal"
            onClose={onClose}
            mainButton={{
                children: isCustomExport ? t("common.exportAndSave") : t("common.export"),
                type: "submit",
                form: INVOICE_EXPORT_FORM_ID,
                disabled: loadingSubmit,
                loading: loadingSubmit,
                "data-testid": "export-invoices-button",
            }}
            secondaryButton={{
                children: t("common.cancel"),
                "data-testid": "cancel-export-button",
                onClick: onClose,
            }}
            size={isCustomExport ? "xlarge" : "large"}
        >
            {modalContent}
            {taskId && (
                <ResourceDownloader
                    taskId={taskId}
                    onDownload={onClose}
                    onDownloadError={() => {
                        toast.error(t("common.error"));
                        onClose();
                    }}
                />
            )}
        </Modal>
    );

    async function handleSubmitForDocumentsExport(
        listType: InvoiceExportListType,
        exportElement: InvoiceExportElement
    ) {
        if (
            getExportItemsTotalCount(itemsCounters, listType, exportElement) >
            MAX_INVOICE_DOCUMENTS_TO_EXPORT
        ) {
            toast.error(t("common.error"));
            onClose();
            return;
        }

        const exportQuery = getQueryFromListType(listType);
        try {
            setLoadingSubmit(true);
            const data = await apiService.post(
                `/invoices/export-documents/?${queryService.toQueryString(exportQuery)}`,
                {export_element: exportElement},
                {apiVersion: "web"}
            );
            setTaskId(data.task.id);
        } catch (error) {
            setLoadingSubmit(false);
            await getErrorMessagesFromServerError(error);
            Logger.error("Error during submit", error);
        }
    }

    async function handleDeleteCustomExport(format: ExportFormat) {
        if (typeof format !== "number" || exports === null) {
            return; // invalid
        }
        const backupExports = cloneDeep(exports);
        const backupFormat = format;

        const newSavedExports = cloneDeep(exports.saved_invoice_exports);
        newSavedExports.splice(format, 1);

        let newFormat: ExportFormat = format;
        if (newSavedExports.length <= 0) {
            newFormat = "excel_custom";
        } else {
            newFormat = Math.max(0, format - 1);
        }
        const newExports = {
            ...exports,
            saved_invoice_exports: newSavedExports,
        };
        // Update the local state immediately
        setFormat(newFormat);
        setExports(newExports);
        // submit the new state to the server and rollback if it fails
        try {
            const savedExportsBody: SavedExportsPatchPayload = {
                saved_invoice_exports: newSavedExports,
            };
            await apiService.patch("/invoices/saved-exports/", savedExportsBody, {
                apiVersion: "web",
            });
        } catch (error) {
            // Restore the previous state
            setFormat(backupFormat);
            setExports(backupExports);
            toast.error(t("common.error"));
            throw error;
        }
    }

    async function handleNewCustomExport() {
        if (exports === null) {
            return; // invalid
        }

        const savedExport: SavedExport = {
            name: formatDate(new Date(), "P"),
            export_type: DEFAULT_EXPORT_TYPE,
            export_element: openedFrom,
            export_list_type:
                selectedInvoicesCount || selectedCreditNotesCount ? "selected" : "filtered",
            columns: [],
        };
        const updatedExports = {
            ...exports,
            saved_invoice_exports: [...exports.saved_invoice_exports, savedExport],
        };

        setFormat(updatedExports.saved_invoice_exports.length - 1);
        setExports(updatedExports);
    }

    async function handleCustomExportSubmit(payload: CustomExportFormPayload) {
        const {columns, name, export_element, export_list_type, export_type} = payload;

        if (name.trim().length <= 0) {
            toast.error(t("common.errors.nameIsRequired"));
            return;
        }

        if (
            getExportItemsTotalCount(itemsCounters, export_list_type, export_element) >
            MAX_INVOICE_ITEMS_TO_EXPORT
        ) {
            toast.error(t("common.error"));
            onClose();
            return;
        }

        if (exports === null) {
            onClose();
            return; // invalid
        }

        setLoadingSubmit(true);

        if (typeof format == "number") {
            const savedExportsBody: SavedExportsPatchPayload = {
                saved_invoice_exports: cloneDeep(exports.saved_invoice_exports),
            };
            savedExportsBody.saved_invoice_exports[format] = cloneDeep(payload);
            // avoid empty name - set the current date as default
            for (let i = 0; i < savedExportsBody.saved_invoice_exports.length; i++) {
                const savedExport = savedExportsBody.saved_invoice_exports[i];
                if (!savedExport.name || savedExport.name.trim().length <= 0) {
                    savedExport.name = formatDate(new Date(), "P");
                }
            }
            try {
                await apiService.patch("/invoices/saved-exports/", savedExportsBody, {
                    apiVersion: "web",
                });
            } catch (error) {
                setLoadingSubmit(false);
                Logger.error(error);
                toast.error(t("common.error"));
            }
        }

        const exportQuery = getQueryFromListType(export_list_type);
        // avoid empty export name - set the current date as default
        const export_name = name ?? formatDate(new Date(), "P");
        const body: InvoiceExportPostPayload = {
            name: export_name,
            export_type,
            export_element,
            export_list_type,
            columns,
        };
        try {
            const data = await apiService.post(
                `/invoices/export/?${queryService.toQueryString(exportQuery)}`,
                body,
                {apiVersion: "web"}
            );
            setTaskId(data.task.id);
        } catch (error) {
            setLoadingSubmit(false);
            Logger.error(error);
            toast.error(t("file.error.couldNotDownload"));
        }
    }

    function getQueryFromListType(listType: InvoiceExportListType) {
        let exportQuery = {};
        if (listType === "filtered") {
            return currentQuery;
        }
        if (listType === "selected") {
            if (
                (openedFrom === "invoice" && selectedInvoicesCount === 0) ||
                (openedFrom === "credit_note" && selectedCreditNotesCount === 0)
            ) {
                // If nothing is selected we force the query to return nothing
                // If not, an empty query will return all the invoices
                return {
                    uid__in: "-1",
                };
            }
            return selectedInvoicesQuery;
        }
        return exportQuery;
    }

    async function OnSubmitAccountingExport() {
        try {
            setLoadingSubmit(true);
            const response = await invoiceApiService.generateAccountingExport();
            setTaskId(response.task.id);
        } catch (error) {
            setLoadingSubmit(false);
            Logger.error(error);
            toast.error(t("file.error.couldNotDownload"));
        }
    }
}
