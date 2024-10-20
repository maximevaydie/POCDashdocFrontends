// Should correspond with type CheckAccountingExportOutput on the backend
export type AccountingExportInfo = NoExportPossible | ExportPossible;

export type ExportError =
    | {error: "no-invoice-to-export"; details: null}
    | {error: "exists-item-with-empty-account-code"; details: null}
    | {error: "exists-customer-with-empty-account-code"; details: {id: number; name: string}[]};

type NoExportPossible = {
    is_export_possible: false;
    errors: ExportError[];
};

type ExportPossible = {
    is_export_possible: true;
    last_exported_date: string;
    invoice_count: number;
    credit_note_count: number;
    total_price_exc_VAT: string;
    start_document_number: string;
    end_document_number: string;
};
