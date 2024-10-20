import {getConnectedCompany} from "@dashdoc/web-common";
import {Logger, TranslationKeys, t} from "@dashdoc/web-core";
import {Box, LoadingWheel, Modal, Text, TextInput} from "@dashdoc/web-ui";
import {InvoiceableCompany} from "dashdoc-utils";
import {FormikProvider, useFormik} from "formik";
import React, {useState} from "react";

import useSimpleFetch from "app/hooks/useSimpleFetch";
import {useCompaniesInConnectedGroupView} from "app/hooks/useCompaniesInConnectedGroupView";
import {fetchSetSingleTransportStatusInvoiced} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {transportRightService} from "app/services/transport";
import {CustomerToInvoiceSelect} from "app/taxation/invoicing/features/customer-to-invoice/CustomerToInvoiceSelect";

import type {Transport} from "app/types/transport";

type MarkInvoicedModalForm = {
    customerToInvoice: InvoiceableCompany | undefined;
    invoiceNumber: string;
};

type MarkInvoicedModalProps = {
    transport: Transport;
    onClose: () => void;
};

type MarkInvoiceErrorCode = "carrier-has-active-invoicing-method" | "unknown";

const ERROR_MESSAGE: Record<MarkInvoiceErrorCode, TranslationKeys> = {
    "carrier-has-active-invoicing-method": "error.carrierHasInvoiceMethod",
    unknown: "common.error",
};

/** Take an unknown error data and return an error code if possible */
const parseErrorData = (errorData: unknown): MarkInvoiceErrorCode => {
    if (typeof errorData !== "object" || errorData === null) {
        return "unknown";
    }
    if (!("error_code" in errorData)) {
        return "unknown";
    }
    if (typeof errorData.error_code !== "string") {
        return "unknown";
    }
    if (errorData.error_code in ERROR_MESSAGE) {
        return errorData.error_code as MarkInvoiceErrorCode;
    }
    return "unknown";
};

export function MarkInvoicedModal({transport, onClose}: MarkInvoicedModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch();

    const url = `/transports/${transport.uid}/can-mark-invoiced/`;
    const {isLoading, hasError, errorData} = useSimpleFetch(url, [], "web");

    const canMarkInvoiced = !isLoading && !hasError;
    const errorCode: MarkInvoiceErrorCode = parseErrorData(errorData);

    const connectedCompany = useSelector(getConnectedCompany);
    const companiesInConnectedGroupView = useCompaniesInConnectedGroupView();

    const canSetCustomerToInvoice =
        transportRightService.canSetCustomerToInvoiceWhenMarkingInvoiced(
            transport,
            connectedCompany?.pk,
            companiesInConnectedGroupView
        );

    const formik = useFormik<MarkInvoicedModalForm>({
        initialValues: {
            invoiceNumber: "",
            customerToInvoice: transport.customer_to_invoice,
        } as MarkInvoicedModalForm,
        onSubmit: handleSubmit,
        validateOnBlur: false,
        validateOnChange: false,
    });

    return (
        <Modal
            title={t("markInvoicedModal.markSingleTransportInvoicedTitle")}
            id="mark-invoiced-modal"
            data-testid="mark-invoiced-modal"
            onClose={onClose}
            mainButton={
                !canMarkInvoiced
                    ? null
                    : {
                          children: t("components.markInvoiced"),
                          disabled: isSubmitting,
                          onClick: formik.submitForm,
                          "data-testid": "mark-invoiced-save",
                      }
            }
            secondaryButton={{
                disabled: isSubmitting,
                "data-testid": "mark-invoiced-cancel-button",
            }}
        >
            {isLoading && <LoadingWheel />}
            {!isLoading && !canMarkInvoiced && (
                <Text data-testid={`error-message-${errorCode}`} color="red.dark">
                    {t(ERROR_MESSAGE[errorCode])}
                </Text>
            )}
            {canMarkInvoiced && (
                <FormikProvider value={formik}>
                    {canSetCustomerToInvoice && (
                        <Box data-testid="set-customer-to-invoice-section">
                            <CustomerToInvoiceSelect
                                label={t("common.customerToInvoice")}
                                value={formik.values.customerToInvoice}
                                onChange={(value) =>
                                    formik.setFieldValue("customerToInvoice", value)
                                }
                                error={formik.errors.customerToInvoice}
                            />
                        </Box>
                    )}
                    <Box mt={2}>
                        <TextInput
                            label={t("markInvoicedModal.invoiceNumber")}
                            name="invoiceNumber"
                            value={formik.values.invoiceNumber}
                            data-testid="mark-invoiced-invoice-number"
                            onChange={(value: string) => {
                                formik.setFieldValue("invoiceNumber", value);
                            }}
                            error={formik.errors.invoiceNumber}
                        />
                    </Box>
                </FormikProvider>
            )}
        </Modal>
    );

    async function handleSubmit(values: MarkInvoicedModalForm) {
        const {invoiceNumber: invoice_number, customerToInvoice} = values;
        setIsSubmitting(true);
        const payload = {
            invoice_number: invoice_number || undefined,
            customer_to_invoice:
                canSetCustomerToInvoice &&
                customerToInvoice &&
                transport.customer_to_invoice?.pk !== customerToInvoice.pk
                    ? {pk: customerToInvoice.pk}
                    : undefined,
        };

        try {
            await dispatch(fetchSetSingleTransportStatusInvoiced(transport.uid, payload));
            onClose();
        } catch (error) {
            Logger.error(error);
        } finally {
            setIsSubmitting(false);
        }
    }
}
