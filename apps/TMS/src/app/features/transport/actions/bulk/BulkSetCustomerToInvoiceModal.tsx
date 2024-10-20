import {getErrorMessageFromServerError} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Link, LoadingWheel, Modal, Text, toast} from "@dashdoc/web-ui";
import {InvoiceableCompany, yup} from "dashdoc-utils";
import {Form, FormikProvider, useFormik} from "formik";
import React, {FunctionComponent, useState} from "react";

import {SelectedTransportsCountCallout} from "app/features/transport/actions/bulk/SelectedTransportsCountCallout";
import {fetchBulkSetCustomerToInvoice} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";
import {CustomerToInvoiceSelect} from "app/taxation/invoicing/features/customer-to-invoice/CustomerToInvoiceSelect";

type BulkSetCustomerToInvoiceStatus = "pending" | "loading" | "done";
type BulkSetCustomerToInvoiceTransportRecap = {
    uid: string;
    customer_to_invoice: InvoiceableCompany;
};
type BulkSetCustomerToInvoiceResponse = {
    response: {
        transports_updated: BulkSetCustomerToInvoiceTransportRecap[];
        errors: {[key: string]: {uid: string; sequential_id: number}[]};
    };
};
type BulkSetCustomerToInvoiceModalProps = {
    selectedTransportsQuery: SearchQuery;
    selectedTransportsCount: number;
    onClose: () => void;
    refetchTransports: () => void;
};

type CustomerToInvoiceForm = {
    customerToInvoice: InvoiceableCompany | null;
};

const BulkSetCustomerToInvoiceModal: FunctionComponent<BulkSetCustomerToInvoiceModalProps> = ({
    selectedTransportsCount,
    selectedTransportsQuery,
    onClose,
}) => {
    const [status, setStatus] = useState<BulkSetCustomerToInvoiceStatus>("pending");
    const [transportsUpdatedCount, setTransportsUpdatedCount] = useState(0);
    const [transportsUnchangedCount, setTransportsUnchangedCount] = useState(0);
    const [errors, setErrors] = useState<{[key: string]: {uid: string; sequential_id: number}[]}>(
        {}
    );

    const dispatch = useDispatch();

    const handleSubmit = async (values: CustomerToInvoiceForm) => {
        const {customerToInvoice} = values;

        if (customerToInvoice === null) {
            return;
        }

        setStatus("loading");
        try {
            const bulkSetCustomerToInvoiceResponse: BulkSetCustomerToInvoiceResponse =
                await dispatch(
                    fetchBulkSetCustomerToInvoice(customerToInvoice.pk, selectedTransportsQuery)
                );

            setTransportsUpdatedCount(
                bulkSetCustomerToInvoiceResponse.response.transports_updated.length
            );

            const transportsUnchangedCount = Object.values(
                bulkSetCustomerToInvoiceResponse.response.errors
            ).reduce((acc, value) => {
                return acc + value.length;
            }, 0);
            setTransportsUnchangedCount(transportsUnchangedCount);

            setErrors(bulkSetCustomerToInvoiceResponse.response.errors);

            setStatus("done");
        } catch (error) {
            const errorMessage = await getErrorMessageFromServerError(error);
            toast.error(errorMessage);
            setStatus("pending");
        }
    };

    const formik = useFormik<CustomerToInvoiceForm>({
        initialValues: {
            customerToInvoice: null,
        },
        validationSchema: yup.object().shape({
            customerToInvoice: yup.mixed().required(t("common.mandatoryField")),
        }),
        validateOnChange: true,
        validateOnBlur: false,
        onSubmit: handleSubmit,
    });

    const getBulkSetCustomerToInvoiceErrorLabel = (errorCode: string, transportCount: number) => {
        switch (errorCode) {
            case "transport_invoiced":
                return t("bulkAction.setCustomerToInvoice.error.transportsInvoiced", {
                    smart_count: transportCount,
                });
            case "set_customer_to_invoice_not_allowed":
                return t("bulkAction.setCustomerToInvoice.error.notCarrierOfTheTransports", {
                    smart_count: transportCount,
                });
            default:
                return t("bulkAction.setCustomerToInvoice.error.default", {
                    smart_count: transportCount,
                });
        }
    };

    return (
        <Modal
            title={t("bulkAction.updateCustomerToInvoice")}
            id="bulk-set-customer-to-invoice-modal"
            onClose={onClose}
            mainButton={
                status === "done"
                    ? {
                          type: "button",
                          onClick: onClose,
                          children: t("common.confirmUnderstanding"),
                      }
                    : {
                          form: "customer-to-invoice-form",
                          type: "submit",
                          children: t("common.update"),
                          severity: "warning",
                          disabled: status !== "pending" || formik.isSubmitting || !formik.isValid,
                      }
            }
            // @ts-ignore
            secondaryButton={status !== "done" && {type: "button", onClick: onClose}}
        >
            {status === "pending" && (
                <>
                    <SelectedTransportsCountCallout
                        variant="warning"
                        selectedTransportsCount={selectedTransportsCount}
                    />
                    <Box mt={5}>
                        <FormikProvider value={formik}>
                            <Form onSubmit={formik.handleSubmit} id="customer-to-invoice-form">
                                <CustomerToInvoiceSelect
                                    required
                                    isClearable={false}
                                    name="customerToInvoice"
                                    label={t("common.customerToInvoice")}
                                    value={formik.values.customerToInvoice}
                                    onChange={(value) => {
                                        formik.setFieldValue("customerToInvoice", value);
                                    }}
                                    error={formik.errors.customerToInvoice as string}
                                />
                            </Form>
                        </FormikProvider>
                    </Box>
                    <Text mt={4}>{t("bulkAction.setCustomerToInvoiceWarning")}</Text>
                </>
            )}
            {status === "loading" && <LoadingWheel noMargin />}
            {status === "done" && (
                <>
                    <Text variant="h1" color="grey.dark">
                        {t("common.processing_completed")}
                    </Text>
                    <Box mt={4} backgroundColor="grey.ultralight" p={4}>
                        <Text variant="h2" mb={2}>
                            {t("common.processing_summary")}
                        </Text>
                        {transportsUpdatedCount > 0 && (
                            <Flex>
                                <Icon
                                    mr={2}
                                    name="checkCircle"
                                    color="green.dark"
                                    alignSelf="center"
                                />
                                <Text>
                                    {t("bulkAction.setCustomerToInvoice.transportsUpdated", {
                                        smart_count: transportsUpdatedCount,
                                    })}
                                </Text>
                            </Flex>
                        )}
                        {transportsUnchangedCount > 0 && (
                            <Flex mb={2}>
                                <Icon
                                    mr={2}
                                    name="removeCircle"
                                    color="red.dark"
                                    alignSelf="center"
                                />
                                <Text>
                                    {t("bulkAction.setCustomerToInvoice.transportsUnchanged", {
                                        smart_count: transportsUnchangedCount,
                                    })}
                                </Text>
                            </Flex>
                        )}
                        {Object.entries(errors).map(([errorCode, transportUids]) => {
                            if (transportUids.length === 0) {
                                return null;
                            }

                            const transportsLinks = transportUids.map(
                                ({uid, sequential_id}, index) => (
                                    <>
                                        {index > 0 && ", "}
                                        <Link
                                            target="_blank"
                                            href={`/app/transports/${uid}`}
                                            rel="noopener noreferrer"
                                        >
                                            {sequential_id}
                                        </Link>
                                    </>
                                )
                            );

                            return (
                                <Box
                                    key={errorCode}
                                    pt={1}
                                    mt={1}
                                    borderTop={"1px solid"}
                                    borderTopColor="grey.light"
                                >
                                    <Text>
                                        {getBulkSetCustomerToInvoiceErrorLabel(
                                            errorCode,
                                            transportUids.length
                                        )}
                                    </Text>
                                    {transportsLinks}
                                </Box>
                            );
                        })}
                    </Box>
                </>
            )}
        </Modal>
    );
};

export default BulkSetCustomerToInvoiceModal;
