import {t} from "@dashdoc/web-core";
import {Modal} from "@dashdoc/web-ui";
import {yup, InvoiceItem} from "dashdoc-utils";
import {useFormik} from "formik";
import React from "react";
import {useSelector} from "react-redux";

import {RootState} from "app/redux/reducers/index";
import {AddInvoiceLineForm} from "app/services/invoicing";

import {EditableInvoiceLinesTable} from "./editable-invoice-lines-table";

import type {AddOrUpdateInvoiceLine} from "app/taxation/invoicing/types/invoice.types";
import type {InvoiceLine} from "app/taxation/invoicing/types/invoiceOrCreditNote.types";

type InvoiceModalLineProps = {
    invoiceLineId?: InvoiceLine["id"];
    mode: "add" | "edit";
    onSubmit: (invoiceLine: AddOrUpdateInvoiceLine) => void;
    onClose: () => void;
    is_dashdoc: boolean;
};

const InvoiceLineModal = ({
    invoiceLineId,
    mode,
    onSubmit,
    onClose,
    is_dashdoc,
}: InvoiceModalLineProps) => {
    const invoiceLine: InvoiceLine | undefined = useSelector((state: RootState) =>
        invoiceLineId === undefined ? undefined : state.entities.invoiceLines[invoiceLineId]
    );

    const handleSubmit = async (values: AddInvoiceLineForm) => {
        const newInvoiceLine: AddOrUpdateInvoiceLine = {
            description: values.description,
            quantity: values.quantity,
            unit_price: values.unit_price,
            invoice_item_uid: values.invoice_item?.uid || null,
        };

        onSubmit(newInvoiceLine);
        onClose();
    };

    const formik = useFormik<AddInvoiceLineForm>({
        initialValues: {
            description: invoiceLine?.description || "",
            quantity: invoiceLine?.quantity || "1",
            unit_price: invoiceLine?.unit_price || "",
            invoice_item: invoiceLine?.invoice_item || null,
        },
        validateOnBlur: false,
        validateOnChange: false,
        validationSchema: yup.object().shape({
            description: yup.string().required(t("common.mandatoryField")),
            invoice_item: yup.mixed().when("is_dashdoc", {
                is: () => is_dashdoc,
                then: () =>
                    yup
                        .object()
                        .shape({
                            uid: yup.string(),
                        })
                        .nullable()
                        .required(t("common.mandatoryField")),
                otherwise: () =>
                    yup
                        .object()
                        .shape({
                            uid: yup.string(),
                        })
                        .nullable(),
            }),
            quantity: yup.string().nullable().required(t("common.mandatoryField")),
            unit_price: yup.string().nullable().required(t("common.mandatoryField")),
        }),
        onSubmit: handleSubmit,
    });

    const submitButtonText = invoiceLineId
        ? t("invoiceLineModal.updateInvoiceLine")
        : t("invoiceLineModal.addInvoiceLine");

    return (
        <Modal
            title={t("invoiceLineModal.title")}
            id="add-edit-invoice-line-modal"
            size={"large"}
            onClose={onClose}
            mainButton={{
                children: submitButtonText,
                form: "add-edit-invoice-line-form",
                type: "submit",
                disabled: formik.isSubmitting,
                onClick: formik.submitForm,
            }}
        >
            <form id="add-invoice-line-form" onSubmit={formik.handleSubmit}>
                <EditableInvoiceLinesTable
                    shouldItemSelectorAutocomplete={mode === "add"}
                    invoiceLines={[formik.values]}
                    errors={formik.errors}
                    onUpdateDescription={(description) => {
                        // @ts-ignore
                        formik.setFieldError("description", null);
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
                        // @ts-ignore
                        formik.setFieldError("quantity", null);
                        formik.setFieldValue("quantity", quantity);
                    }}
                    onUpdateUnitPrice={(unitPrice) => {
                        // @ts-ignore
                        formik.setFieldError("unit_price", null);
                        formik.setFieldValue("unit_price", unitPrice);
                    }}
                />
            </form>
        </Modal>
    );
};

export default InvoiceLineModal;
