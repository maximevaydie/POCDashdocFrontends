export type InvoiceExportType = "global" | "detailed";
export type InvoiceExportElement = "invoice" | "credit_note" | "all";
export type InvoiceExportListType = "filtered" | "selected" | "all";

export type SavedExport = {
    name: string;
    export_type: InvoiceExportType;
    export_element: InvoiceExportElement;
    export_list_type: InvoiceExportListType;
    columns: string[];
};

export type ColumnsSpec = {
    all_columns: {
        /**
         * Sample:
         * {
         *   "Informations du transport": [
         *     ["uid", "Numéro de suivi"],
         *     ["transport_number", "Numéro de transport"],
         *   ]
         * }
         */
        [key: string]: [string, string][];
    };
};

export type ExportsList = {
    detailed_invoice_exports: ColumnsSpec;
    global_invoice_exports: ColumnsSpec;
    saved_invoice_exports: SavedExport[];
};
export type InvoiceCountersForExport = {
    all_invoices_count: number;
    filtered_invoices_count: number;
    all_credit_notes_count: number;
    filtered_credit_notes_count: number;
};
export type ExportInfo = {
    exports: ExportsList;
    counters: InvoiceCountersForExport;
};

export type SavedExportsPatchPayload = {
    saved_invoice_exports: SavedExport[];
};

export type InvoiceExportPostPayload = {
    name: string;
    export_type: InvoiceExportType;
    export_element: InvoiceExportElement;
    export_list_type: InvoiceExportListType;
    columns: string[];
};

export type ExportTransportsData = {
    exportName: string;
};

export type ExportTransportsPostPayload = {
    filters: string;
    export_name: string;
    columns: string[];
};

export type InvoiceExportOpenedFrom = Extract<InvoiceExportElement, "invoice" | "credit_note">;
