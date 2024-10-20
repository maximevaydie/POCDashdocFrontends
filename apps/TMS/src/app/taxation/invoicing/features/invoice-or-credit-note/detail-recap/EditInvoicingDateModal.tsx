import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {Box, DatePicker, Modal, Text} from "@dashdoc/web-ui";
import {formatDate, parseDate, yup} from "dashdoc-utils";
import {FormikProvider, useFormik} from "formik";
import React, {useCallback} from "react";

import {useDispatch} from "app/redux/hooks";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";
import {getDueDateFromInvoicingDate} from "app/taxation/invoicing/services/invoiceOrCreditNote.service";

import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";
import type {Invoice} from "app/taxation/invoicing/types/invoice.types";

type EditInvoicingDateModalProps = {
    itemUid: string;
    initialInvoicingDate: string | null;
    initialDueDate: string | null;
    fetchUpdate: (
        invoiceUid: string,
        payload: Partial<Invoice | CreditNote>
    ) => (dispatch: Function) => Promise<Partial<Invoice> | Partial<CreditNote>>;
    onClose: () => void;
};

interface EditInvoicingDateForm {
    invoicingDate: Date | null;
    dueDate: Date | null;
}

export function EditInvoicingAndDueDatesModal({
    itemUid,
    initialInvoicingDate,
    initialDueDate,
    fetchUpdate,
    onClose,
}: EditInvoicingDateModalProps) {
    const dispatch = useDispatch();
    const hasDashdocInvoicing = useHasDashdocInvoicingEnabled();

    const handleSubmit = useCallback(
        async (values: EditInvoicingDateForm) => {
            try {
                await dispatch(
                    fetchUpdate(itemUid, {
                        invoicing_date: formatDate(values.invoicingDate, "yyyy-MM-dd"),
                        due_date: hasDashdocInvoicing
                            ? formatDate(values.dueDate, "yyyy-MM-dd")
                            : undefined,
                    })
                );
                onClose();
            } catch (error) {
                Logger.error(
                    "An error occurred while updating the invoicing date of the invoice !",
                    error
                );
            }
        },
        [dispatch, onClose, fetchUpdate, itemUid]
    );

    const initialValues = {
        invoicingDate: initialInvoicingDate ? parseDate(initialInvoicingDate) : new Date(),
        dueDate: initialDueDate ? parseDate(initialDueDate) : null,
    };
    if (!initialValues.dueDate && initialValues.invoicingDate) {
        initialValues.dueDate = getDueDateFromInvoicingDate(initialValues.invoicingDate);
    }

    const formik = useFormik<EditInvoicingDateForm>({
        initialValues,
        validateOnBlur: true,
        validateOnChange: true,
        validationSchema: yup.object().shape({
            invoicingDate: yup.date().nullable().required(t("common.mandatoryField")),
            dueDate: hasDashdocInvoicing
                ? yup
                      .date()
                      .nullable()
                      .required(t("common.mandatoryField"))
                      .when(["invoicingDate"], (invoicingDate, schema) => {
                          if (invoicingDate) {
                              return schema.min(
                                  invoicingDate,
                                  t("invoice.dueDateMustBeAfterInvoicingDate")
                              );
                          }
                          return schema;
                      })
                : yup.date().nullable(),
        }),
        onSubmit: handleSubmit,
    });

    return (
        <Modal
            title={t("components.invoicingDateModification")}
            mainButton={{
                onClick: formik.submitForm,
                disabled: formik.isSubmitting,
                "data-testid": "edit-invoice-invoicing-date-modal-save",
                children: t("common.save"),
            }}
            secondaryButton={{
                onClick: onClose,
                "data-testid": "edit-invoice-invoicing-date-modal-close",
            }}
            onClose={onClose}
            data-testid="edit-invoice-invoicing-date-modal"
        >
            <FormikProvider value={formik}>
                <Text mb={5}>{t("components.invoicingAndDueDatesInfo")}</Text>
                <Box width={"100%"}>
                    <DatePicker
                        required
                        clearable
                        label={t("common.invoicingDate")}
                        date={formik.values.invoicingDate}
                        onChange={async (date) => {
                            await formik.setFieldValue("invoicingDate", date);
                            if (date) {
                                formik.setFieldValue("dueDate", getDueDateFromInvoicingDate(date));
                            }
                        }}
                        data-testid="edit-invoicing-date-picker"
                        rootId="react-app-modal-root"
                        error={formik.errors.invoicingDate as string}
                    />
                </Box>
                {hasDashdocInvoicing && (
                    <Box width={"100%"} mt={4}>
                        <DatePicker
                            required
                            clearable
                            label={t("common.dueDate")}
                            date={formik.values.dueDate}
                            onChange={(date) => formik.setFieldValue("dueDate", date)}
                            data-testid="edit-due-date-picker"
                            rootId="react-app-modal-root"
                            error={formik.errors.dueDate as string}
                        />
                    </Box>
                )}
            </FormikProvider>
        </Modal>
    );
}
