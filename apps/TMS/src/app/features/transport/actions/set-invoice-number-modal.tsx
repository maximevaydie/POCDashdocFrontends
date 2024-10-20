import {Logger, TranslationKeys, t} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    Flex,
    IconButton,
    LoadingWheel,
    Modal,
    Text,
    TextInput,
} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {FormikProvider, useFormik} from "formik";
import React, {useState} from "react";

import useSimpleFetch from "app/hooks/useSimpleFetch";
import {fetchSetInvoiceNumber} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

import type {Transport} from "app/types/transport";

type SetInvoicedNumberModalForm = {
    invoiceNumber: string;
};

type SetInvoicedNumberModalProps = {
    transport: Transport;
    onClose: () => void;
};

type SetInvoiceNumberErrorCode =
    | "carrier-has-active-invoicing-method"
    | "carrier-can-edit-invoice-number-only-if-transport-is-finished"
    | "unknown";

const ERROR_MESSAGE: Record<SetInvoiceNumberErrorCode, TranslationKeys> = {
    "carrier-has-active-invoicing-method": "error.carrierHasInvoiceMethod",
    "carrier-can-edit-invoice-number-only-if-transport-is-finished":
        "error.carrierCanEditInvoiceNumberOnlyIfTransportIsFinished",
    unknown: "common.error",
};

/** Take an unknown error data and return an error code if possible */
const parseErrorData = (errorData: unknown): SetInvoiceNumberErrorCode => {
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
        return errorData.error_code as SetInvoiceNumberErrorCode;
    }
    return "unknown";
};

export function SetInvoiceNumberModal({transport, onClose}: SetInvoicedNumberModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch();

    // Check if the current company can set an invoice number
    const url = `/transports/${transport.uid}/can-set-invoice-number/`;
    const {isLoading, hasError, errorData} = useSimpleFetch(url, [], "web");

    const canMarkInvoiced = !isLoading && !hasError;
    const errorCode: SetInvoiceNumberErrorCode = parseErrorData(errorData);

    const validationSchema = yup.object().shape({
        invoiceNumber: yup.string(),
    });
    const formik = useFormik<SetInvoicedNumberModalForm>({
        initialValues: {
            invoiceNumber: transport.invoice_number || "",
        },
        onSubmit: handleSubmit,
        validateOnBlur: true,
        validateOnChange: true,
        validationSchema: validationSchema,
    });

    return (
        <Modal
            title={t("SetInvoiceNumberModal.title")}
            id="set-invoice-number-modal"
            data-testid="set-invoice-number-modal"
            onClose={onClose}
            mainButton={
                !canMarkInvoiced
                    ? null
                    : {
                          children: t("common.save"),
                          disabled: isSubmitting || !formik.isValid,
                          onClick: formik.submitForm,
                          "data-testid": "set-invoice-number-save",
                      }
            }
            secondaryButton={{
                disabled: isSubmitting,
            }}
        >
            {isLoading && <LoadingWheel />}
            {!isLoading && !canMarkInvoiced && (
                <Callout variant="warning" marginBottom={2}>
                    <Text data-testid={`error-message-${errorCode}`}>
                        {t(ERROR_MESSAGE[errorCode])}
                    </Text>
                </Callout>
            )}
            {!isLoading && (
                <FormikProvider value={formik}>
                    <Box mt={2}>
                        <Flex flexDirection="row">
                            <Flex flexGrow={1} flexDirection="column" alignItems={"stretch"}>
                                <TextInput
                                    label={t("setInvoiceNumberModal.invoiceNumber")}
                                    name="invoiceNumber"
                                    disabled={!canMarkInvoiced || isSubmitting}
                                    value={formik.values.invoiceNumber}
                                    data-testid="invoice-number-input"
                                    onChange={(value: string) => {
                                        formik.setFieldValue("invoiceNumber", value);
                                    }}
                                    flexGrow={1}
                                    width={"100%"}
                                />
                            </Flex>
                            <IconButton
                                name="delete"
                                scale={[1.33, 1.33]}
                                ml={2}
                                onClick={() => {
                                    formik.setFieldValue("invoiceNumber", "");
                                }}
                                data-testid={"empty-invoice-number"}
                            />
                        </Flex>
                    </Box>
                </FormikProvider>
            )}
        </Modal>
    );

    async function handleSubmit(values: SetInvoicedNumberModalForm) {
        const {invoiceNumber} = values;
        setIsSubmitting(true);

        try {
            await dispatch(fetchSetInvoiceNumber(transport.uid, invoiceNumber));
            onClose();
        } catch (error) {
            Logger.error(error);
        } finally {
            setIsSubmitting(false);
        }
    }
}
