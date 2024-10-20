import {t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";

export const toastInvoiceLineCreationError = (errorCode: string | undefined = undefined) => {
    let toastMessage = t("invoices.couldNotCreateInvoiceLine");
    const toastId = errorCode
        ? `invoice-line-creation-toast-error-${errorCode}`
        : "invoice-line-creation-toast-error";
    if (errorCode === "mandatory_invoice_item") {
        toastMessage = t("invoice.mandatoryInvoiceItemToastError");
    }

    toast.error(toastMessage, {
        toastId: toastId,
    });
};

export const toastInvoiceLineUpdateError = (errorCode: string | undefined = undefined) => {
    let toastMessage = t("invoices.error.couldNotUpdateInvoiceLine");
    const toastId = errorCode
        ? `invoice-line-update-toast-error-${errorCode}`
        : "invoice-line-update-toast-error";
    if (errorCode === "mandatory_invoice_item") {
        toastMessage = t("invoice.mandatoryInvoiceItemToastError");
    }
    toast.error(toastMessage, {
        toastId: toastId,
    });
};

export const toastInvoiceFuelSurchargeUpdateError = (
    errorCode: string | undefined = undefined
) => {
    let toastMessage = t("invoices.error.couldNotUpdateInvoiceFuelSurcharge");
    if (errorCode === "mandatory_invoice_item") {
        toastMessage = t("invoice.mandatoryInvoiceItemToastError");
    }
    const toastId = errorCode
        ? `invoice-fuel-surcharge-update-toast-error-${errorCode}`
        : "invoice-fuel-surcharge-update-toast-error";
    toast.error(toastMessage, {
        toastId: toastId,
    });
};

export const toastFinalizeInvoiceError = (failedCount: number) => {
    let toastMessage = t("invoices.error.couldNotMarkInvoicesFinal", {
        smart_count: failedCount,
        count: failedCount,
    });
    toast.error(toastMessage, {
        toastId: "finalize-invoice-toast-error",
    });
};

export const toastFinalizeInvoiceSuccess = (selectedDraftCount: number) => {
    const toastMessage = t("invoices.invoiceSuccessfullyMarkedFinal", {
        smart_count: selectedDraftCount,
    });
    const toastId = "finalize-invoice-toast-success";
    toast.success(toastMessage, {
        toastId: toastId,
    });
};

export const toastSetInvoiceTemplateError = () => {
    toast.error(t("invoice.error.failedToSetDescriptionTemplate"), {
        toastId: "invoice-error-failed-to-set-description-template",
    });
};

export const toastCreateBareInvoiceError = () => {
    toast.error(t("invoice.error.failedToCreateBareInvoice"), {
        toastId: "invoice-error-failed-to-create-bare-invoice",
    });
};

export const toastCreateBareCreditNoteError = () => {
    toast.error(t("invoice.error.failedToCreateBareCreditNote"), {
        toastId: "invoice-error-failed-to-create-bare-credit-note",
    });
};

export const toastSuccessfullyGeneratedAccountingExport = () => {
    toast.success(t("invoice.successfullyExportedToAccounting"), {
        toastId: "invoice-export-to-accounting-success-toast",
    });
};

export const toastGenerateAccountingExportError = () => {
    toast.error(t("invoice.error.ExportToAccounting"), {
        toastId: "invoice-export-to-accounting-error-toast",
    });
};

export const toastCreditNoteLineCreationError = () => {
    let toastMessage = t("creditNotes.error.couldNotCreateCreditNoteLine");
    const toastId = "credit-note-line-creation-toast-error";

    toast.error(toastMessage, {
        toastId: toastId,
    });
};

export const toastCreditNoteLineUpdateError = () => {
    let toastMessage = t("creditNotes.error.couldNotUpdateCreditNoteLine");
    const toastId = "credit-note-line-update-toast-error";
    toast.error(toastMessage, {
        toastId: toastId,
    });
};

export const toastCreditNoteLineDeleteError = () => {
    let toastMessage = t("creditNotes.error.couldNotDeleteCreditNoteLine");
    const toastId = "credit-note-line-delete-toast-error";
    toast.error(toastMessage, {
        toastId: toastId,
    });
};
