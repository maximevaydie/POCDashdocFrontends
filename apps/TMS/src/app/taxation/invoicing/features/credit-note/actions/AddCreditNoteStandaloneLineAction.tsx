import {t} from "@dashdoc/web-core";
import {Button, Modal} from "@dashdoc/web-ui";
import {InvoiceItem, useToggle, yup} from "dashdoc-utils";
import {useFormik} from "formik";
import React, {FC} from "react";

import {EditableInvoiceLinesTable} from "app/features/pricing/invoices/invoice-line-modal/editable-invoice-lines-table";
import {
    CreditNoteStandaloneLineUpsertInput,
    createCreditNoteStandaloneLine,
} from "app/taxation/invoicing/features/credit-note/hooks/creditNoteStandaloneLineCrud.service";
import {toastCreditNoteLineCreationError} from "app/taxation/invoicing/services/invoicingToasts";

import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";

export const AddCreditNoteStandaloneLineAction: FC<{
    creditNote: CreditNote;
    successCallback: () => unknown;
}> = ({creditNote, successCallback}) => {
    const [isModalOpen, openModal, closeModal] = useToggle(false);
    return (
        <>
            <Button
                mr={5}
                variant="secondary"
                onClick={openModal}
                data-testid="add-standalone-line-button"
            >
                {t("creditNote.addInvoiceLine")}
            </Button>
            {isModalOpen && (
                <AddStandaloneCreditNoteLineModal
                    creditNoteUid={creditNote.uid}
                    onClose={closeModal}
                    successCallback={successCallback}
                />
            )}
        </>
    );
};

type FormContent = {
    description: string;
    quantity: string;
    unit_price: string;
    invoice_item: InvoiceItem | null;
};

const AddStandaloneCreditNoteLineModal = ({
    creditNoteUid,
    onClose,
    successCallback,
}: {
    creditNoteUid: string;
    onClose: () => unknown;
    successCallback: () => unknown;
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
            await createCreditNoteStandaloneLine(creditNoteUid, payload);
            successCallback();
            onClose();
        } catch (err) {
            toastCreditNoteLineCreationError();
        }
    };

    const formik = useFormik<FormContent>({
        initialValues: {
            description: "",
            quantity: "1",
            unit_price: "",
            invoice_item: null,
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
            title={t("addCreditNoteLineModal.Title")}
            id="add-edit-credit-note-line-modal"
            size={"large"}
            onClose={onClose}
            mainButton={{
                children: t("addCreditNoteLineModal.ConfirmButton"),
                form: "add-edit-credit-note-line-form",
                type: "submit",
                disabled: formik.isSubmitting,
                onClick: formik.submitForm,
            }}
        >
            <form id="add-invoice-line-form" onSubmit={formik.handleSubmit}>
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
