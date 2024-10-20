import {t} from "@dashdoc/web-core";
import {Box, Flex, ModeTypeSelector, Select, Text, TextInput} from "@dashdoc/web-ui";
import React, {useState} from "react";
import cloneDeep from "rfdc/default";

import {AvailableColumnsField} from "app/features/export/export-transports/forms/field/AvailableColumnsField";
import {SelectedColumnsField} from "app/features/export/export-transports/forms/field/SelectedColumnsField";
import {ExportedItemsTypeSelector} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/ExportedItemsTypeSelector";
import {
    INVOICE_EXPORT_FORM_ID,
    MAX_INVOICE_ITEMS_TO_EXPORT,
} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/invoiceExport.service";
import {InvoiceExportItemsCounters} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/InvoiceExportModal";
import {
    ColumnsSpec,
    InvoiceExportType,
    ExportsList,
    SavedExport,
    InvoiceExportElement,
    InvoiceExportOpenedFrom,
} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/types";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";

type Props = {
    onSubmit: (payload: SavedExport) => Promise<void>;
    value: SavedExport;
    exportsList: ExportsList;
    itemsCounters: InvoiceExportItemsCounters;
    openedFrom: InvoiceExportOpenedFrom;
    withColumnSelector?: boolean;
};

type ExportTypeOption = {value: InvoiceExportType; label: string};

export type CustomExportFormPayload = SavedExport;

export function InvoiceExportForm({
    onSubmit,
    value,
    exportsList,
    itemsCounters,
    openedFrom,
    withColumnSelector = true,
}: Props) {
    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();

    let exportTypeOptions: ExportTypeOption[] = [
        {
            value: "global",
            label: t("invoiceExportModal.globalExport"),
        },
        {
            value: "detailed",
            label: t("invoiceExportModal.detailedExport"),
        },
    ];

    const [formState, setFormState] = useState<SavedExport>(() => cloneDeep(value));

    let columnsSpec: ColumnsSpec;
    switch (formState.export_type) {
        case "global":
            columnsSpec = exportsList.global_invoice_exports;
            break;
        case "detailed":
            columnsSpec = exportsList.detailed_invoice_exports;
            break;
        default:
            columnsSpec = exportsList.global_invoice_exports;
            break;
    }

    const handleUpdateColumnsMemoized = React.useCallback(handleUpdateColumns, []);

    return (
        <form onSubmit={handleSubmit} id={INVOICE_EXPORT_FORM_ID}>
            <Box
                style={{
                    ...(withColumnSelector && {
                        display: "grid",
                        gridTemplateColumns: "4fr 3fr",
                        gap: "24px",
                        height: "700px",
                    }),
                }}
                {...(!withColumnSelector && {
                    backgroundColor: "grey.white",
                    border: "1px solid",
                    borderRadius: 1,
                    borderColor: "grey.light",
                })}
            >
                <Flex
                    p={4}
                    flexGrow={1}
                    style={{
                        overflow: "scroll",
                    }}
                    flexDirection="column"
                    backgroundColor="grey.white"
                >
                    <Text variant="h1" color="grey.dark" mb={2}>
                        {t("common.general")}
                    </Text>
                    <Flex flexDirection="column">
                        <TextInput
                            id="export-name"
                            label={t("common.exportName")}
                            type="text"
                            required
                            placeholder={t("common.name")}
                            onChange={(name) => setFormState((prev) => ({...prev, name}))}
                            value={formState.name}
                            data-testid="export-name"
                        />
                    </Flex>
                    <Text variant="h1" color="grey.dark" mt={5} mb={2}>
                        {t("common.exportType")}
                    </Text>
                    <Select<ExportTypeOption>
                        options={exportTypeOptions}
                        onChange={(option: ExportTypeOption) => {
                            handleUpdateExportType(option?.value);
                        }}
                        value={exportTypeOptions.find(
                            (option) => option.value === formState.export_type
                        )}
                        isClearable={false}
                        data-testid="export-type"
                    />
                    <Text variant="h1" color="grey.dark" mt={5} mb={2}>
                        {t("invoiceExportModal.elementsToExport")}
                    </Text>{" "}
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
                                currentMode={formState.export_element}
                                setCurrentMode={(mode: InvoiceExportElement) => {
                                    if (
                                        formState.export_list_type === "selected" &&
                                        mode !== formState.export_element
                                    ) {
                                        setFormState((prev) => ({
                                            ...prev,
                                            export_list_type: "filtered",
                                            export_element: mode,
                                        }));
                                    } else {
                                        setFormState((prev) => ({
                                            ...prev,
                                            export_element: mode,
                                        }));
                                    }
                                }}
                            />

                            <Box mt={4} />
                        </>
                    )}
                    <ExportedItemsTypeSelector
                        listType={formState.export_list_type}
                        setListType={(value) => {
                            setFormState((prev) => ({...prev, export_list_type: value}));
                        }}
                        itemsCounters={itemsCounters}
                        exportElement={formState.export_element}
                        maxItemsToExport={MAX_INVOICE_ITEMS_TO_EXPORT}
                        openedFrom={openedFrom}
                    />
                    {withColumnSelector && (
                        <>
                            <Text variant="h1" color="grey.dark" mt={4} mb={2}>
                                {t("common.availableColumns")}
                            </Text>
                            <Box>
                                <AvailableColumnsField
                                    columnsSpec={columnsSpec}
                                    columns={formState.columns}
                                    onChange={handleUpdateColumnsMemoized}
                                />
                            </Box>
                        </>
                    )}
                </Flex>

                {withColumnSelector && (
                    <Flex
                        p={4}
                        pl={4}
                        style={{overflowY: "hidden"}}
                        flexDirection="column"
                        backgroundColor="grey.white"
                        flex={1}
                    >
                        <Text variant="h1" color="grey.dark" mb={2}>
                            {t("common.exportedColumns")}
                        </Text>
                        {formState.columns.length === 0 && (
                            <Text variant="h1" color="grey.default" ml={4} mt={4}>
                                {t("exportModal.addColumnsToExport")}
                            </Text>
                        )}

                        <Box pl={5} style={{overflowY: "auto"}}>
                            <SelectedColumnsField
                                columnsSpec={columnsSpec}
                                columns={formState.columns}
                                onChange={handleUpdateColumnsMemoized}
                            />
                        </Box>
                    </Flex>
                )}
            </Box>
        </form>
    );

    function handleUpdateExportType(exportType: InvoiceExportType) {
        setFormState((prev) => ({
            ...prev,
            export_type: exportType,
            columns: [],
        }));
    }

    function handleUpdateColumns(columns: string[]) {
        setFormState((prev) => ({...prev, columns}));
    }

    async function handleSubmit(event: React.SyntheticEvent<EventTarget>) {
        event.preventDefault();
        await onSubmit(formState);
    }
}
