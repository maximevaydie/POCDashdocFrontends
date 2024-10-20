import {t} from "@dashdoc/web-core";
import {Modal} from "@dashdoc/web-ui";
import {InvoiceItem, yup} from "dashdoc-utils";
import {useFormik} from "formik";
import React from "react";

import {EditableInvoiceLinesTable} from "app/features/pricing/invoices/invoice-line-modal/editable-invoice-lines-table";
import {
    CreditNoteStandaloneLineUpsertInput,
    updateCreditNoteStandaloneLine,
} from "app/taxation/invoicing/features/credit-note/hooks/creditNoteStandaloneLineCrud.service";
import {toastCreditNoteLineUpdateError} from "app/taxation/invoicing/services/invoicingToasts";

import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";

type FormContent = {
    description: string;
    quantity: string;
    unit_price: string;
    invoice_item: InvoiceItem | null;
};

export const UpdateStandaloneCreditNoteLineModal = ({
    creditNoteUid,
    line,
    onClose,
}: {
    creditNoteUid: string;
    line: CreditNote["lines"][0];
    onClose: () => unknown;
}) => {
    const handleSubmit = async (values: FormContent) => {
        if (values.invoice_item === null || values.invoice_item.uid === null) {
            // should not happen
            return;
        }
        const payload: CreditNoteStandaloneLineUpsertInput = {
            ...values,
            invoice_item_uid: values.invoice_item.uid,
        };
        try {
            await updateCreditNoteStandaloneLine(creditNoteUid, line.id, payload);
            onClose();
        } catch (e) {
            toastCreditNoteLineUpdateError();
        }
    };

    const formik = useFormik<FormContent>({
        initialValues: {
            description: line.description,
            quantity: line.quantity,
            unit_price: line.unit_price ?? "",
            invoice_item: line.invoice_item ?? null,
        },
        validateOnBlur: false,
        validateOnChange: false,
        validationSchema: yup.object().shape({
            description: yup.string().required(t("common.mandatoryField")),
            invoice_item: yup
                .object()
                .shape({
                    uid: yup.string(),
                })
                .nullable()
                .required(t("common.mandatoryField")),
            quantity: yup.string().nullable().required(t("common.mandatoryField")),
            unit_price: yup.string().nullable().required(t("common.mandatoryField")),
        }),
        onSubmit: handleSubmit,
    });

    return (
        <Modal
            title={t("updateCreditNoteLineMode.title")}
            id="add-edit-credit-note-line-modal"
            size={"large"}
            onClose={onClose}
            mainButton={{
                children: t("updateCreditNoteLineMode.confirmButton"),
                form: "add-edit-invoice-line-form",
                type: "submit",
                disabled: formik.isSubmitting,
                onClick: formik.submitForm,
            }}
        >
            <form id="update-invoice-line-form" onSubmit={formik.handleSubmit}>
                <EditableInvoiceLinesTable
                    shouldItemSelectorAutocomplete
                    invoiceLines={[formik.values]}
                    errors={formik.errors}
                    onUpdateDescription={(description) => {
                        formik.setFieldError("description", undefined);
                        formik.setFieldValue("description", description);
                    }}
                    onUpdateInvoiceItem={(
                        invoiceItem: InvoiceItem | null,
                        autoCompleted: boolean
                    ) => {
                        formik.setFieldValue("invoice_item", invoiceItem);
                        if (!autoCompleted && invoiceItem !== null) {
                            formik.setFieldValue("description", invoiceItem.description);
                        }
                    }}
                    onUpdateQuantity={(quantity) => {
                        formik.setFieldError("quantity", undefined);
                        formik.setFieldValue("quantity", quantity);
                    }}
                    onUpdateUnitPrice={(unitPrice) => {
                        formik.setFieldError("unit_price", undefined);
                        formik.setFieldValue("unit_price", unitPrice);
                    }}
                />
            </form>
        </Modal>
    );
};
