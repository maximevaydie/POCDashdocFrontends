import {HasFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Text, Modal, Callout, Flex, Icon, Box, DatePicker} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import {formatDate, parseDate, yup} from "dashdoc-utils";
import {isBefore} from "date-fns";
import {useFormik, FormikProvider} from "formik";
import React from "react";

import {LinkToInvoice} from "app/taxation/invoicing/features/credit-note/LinkToInvoice";
import {useInvoiceSettings} from "app/taxation/invoicing/hooks/useInvoiceSettings";
import {useLastInvoicingDate} from "app/taxation/invoicing/hooks/useLastInvoicingDate";
import {getDueDateFromInvoicingDate} from "app/taxation/invoicing/services/invoiceOrCreditNote.service";

import type {InvoiceLink} from "app/taxation/invoicing/types/creditNote.types";
type FormValues = {
    invoicingDate: Date | null;
    dueDate: Date | null;
};
export function FinalizeModal({
    invoicingDate,
    dueDate,
    generatedFromInvoice,
    onClose,
    onSubmit,
}: {
    invoicingDate: string | null;
    dueDate: string | null;
    generatedFromInvoice: InvoiceLink | null;
    onClose: () => void;
    onSubmit: (dueDate: string, invoicingDate: string) => void;
}) {
    const {isLoading: isFetchingLastInvoicingDate, data: lastInvoicingDateData} =
        useLastInvoicingDate();
    const {invoiceSettings} = useInvoiceSettings();
    const lastInvoiceDateOutsideDashdoc = parseDate(
        invoiceSettings?.numbering_settings?.last_invoice_date_outside_dashdoc
    );

    const initialValues = {
        invoicingDate: invoicingDate ? parseDate(invoicingDate) : new Date(),
        dueDate: dueDate ? parseDate(dueDate) : null,
    };
    if (!initialValues.dueDate && initialValues.invoicingDate) {
        initialValues.dueDate = getDueDateFromInvoicingDate(initialValues.invoicingDate);
    }
    const submit = async (values: {
        documentNumber: string;
        invoicingDate: Date;
        dueDate: Date;
    }) => {
        const invoicingDateToSubmit = formatDate(values.invoicingDate, "yyyy-MM-dd");
        const dueDateToSubmit = formatDate(values.dueDate, "yyyy-MM-dd");
        onSubmit(invoicingDateToSubmit, dueDateToSubmit);
    };
    const formik = useFormik<FormValues>({
        initialValues,
        validationSchema: getValidationSchema(),
        validateOnBlur: true,
        validateOnChange: true,
        onSubmit: submit,
    });

    return (
        <Modal
            title={t("creditNote.finalize.modalTitle")}
            onClose={onClose}
            mainButton={{
                children: t("creditNote.finalize.modalTitle"),
                onClick: formik.submitForm,
            }}
            secondaryButton={{}}
            data-testid="finalize-credit-note"
        >
            {isFetchingLastInvoicingDate ? (
                <LoadingWheel />
            ) : (
                <>
                    <FormikProvider value={formik}>
                        <form id={"finalize-credit-note-form"} onSubmit={formik.submitForm}>
                            <>
                                <Flex mb={4} alignItems="center">
                                    <Text>{t("invoice.doubleCheckInvoicingAndDueDate")}</Text>
                                </Flex>
                                <DatePicker
                                    required
                                    clearable
                                    label={t("common.invoicingDate")}
                                    date={formik.values.invoicingDate}
                                    onChange={async (date) => {
                                        await formik.setFieldError("invoicingDate", undefined);
                                        await formik.setFieldValue(
                                            "invoicingDate",
                                            date || undefined
                                        );
                                        if (date) {
                                            formik.setFieldValue(
                                                "dueDate",
                                                getDueDateFromInvoicingDate(date)
                                            );
                                        }
                                    }}
                                    data-testid="finalize-credit-note-invoicing-date-picker"
                                    rootId="react-app-modal-root"
                                    error={formik.errors.invoicingDate as string}
                                />
                            </>

                            <Box mt={3}>
                                <DatePicker
                                    required
                                    clearable
                                    label={t("common.dueDate")}
                                    date={formik.values.dueDate}
                                    onChange={(date) => {
                                        formik.setFieldError("dueDate", undefined);
                                        formik.setFieldValue("dueDate", date || undefined);
                                    }}
                                    data-testid="finalize-credit-note-due-date-picker"
                                    rootId="react-app-modal-root"
                                    error={formik.errors.dueDate as string}
                                />
                            </Box>
                        </form>
                        {!!formik.values.invoicingDate &&
                            !formik.errors.invoicingDate &&
                            !!lastInvoicingDateData?.last_invoicing_date &&
                            isBefore(
                                formik.values.invoicingDate,
                                parseDate(lastInvoicingDateData.last_invoicing_date) as Date
                            ) && (
                                <HasFeatureFlag flagName="dashdocInvoicing">
                                    <Callout
                                        mt={3}
                                        variant="warning"
                                        data-testid="finalize-credit-note-invoicing-date-before-last-invoice-date-warning"
                                    >
                                        <Text>
                                            {t(
                                                "invoice.markFinalInvoicingDateBeforeLastInvoicingDate",
                                                {
                                                    invoicingDate: formatDate(
                                                        parseDate(
                                                            lastInvoicingDateData.last_invoicing_date
                                                        ),
                                                        "P"
                                                    ),
                                                }
                                            )}
                                        </Text>
                                        <Text>
                                            {t("creditNote.finalizeModal.numberingInconsistency")}
                                        </Text>
                                    </Callout>
                                </HasFeatureFlag>
                            )}
                    </FormikProvider>

                    {generatedFromInvoice && (
                        <Box mt={4} borderTop="1px solid" borderTopColor="grey.light" pt={4}>
                            <Text>{t("creditNote.finalizeModal.byFinalizingCreditNote")}</Text>
                            <Flex>
                                <Icon name="alert" mr={2} color="red.default" />
                                <Text mr={1}>
                                    {t(
                                        "creditNote.finalizeModal.theInvoiceGeneratedFromWillBeCancelled"
                                    )}
                                </Text>
                                <Text>
                                    {/* eslint-disable-next-line react/jsx-no-literals */}
                                    {"("}
                                    <LinkToInvoice
                                        generatedFromInvoice={generatedFromInvoice}
                                        openInNewTab
                                    />
                                    {/* eslint-disable-next-line react/jsx-no-literals */}
                                    {")"}
                                </Text>
                            </Flex>
                            <Flex>
                                <Icon name="checkCircle" mr={2} color="green.dark" />
                                <Text>
                                    {t(
                                        "creditNote.finalizeModal.transportsModifiableAndBillableAgain"
                                    )}
                                </Text>
                            </Flex>
                        </Box>
                    )}
                </>
            )}
        </Modal>
    );

    function getValidationSchema() {
        let schema = {
            invoicingDate: yup.date().nullable().required(t("common.mandatoryField")),
            dueDate: yup
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
                }),
        };

        if (lastInvoiceDateOutsideDashdoc) {
            schema.invoicingDate = schema.invoicingDate.min(
                lastInvoiceDateOutsideDashdoc,
                t("invoice.markFinalInvoicingDateBeforeLastInvoiceDateOutsideDashdocError", {
                    invoiceDate: formatDate(lastInvoiceDateOutsideDashdoc, "P"),
                })
            );
        }

        return yup.object().shape(schema);
    }
}
