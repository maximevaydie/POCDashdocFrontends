import {ALL_LOCALE_LABELS, Locale, Logger, t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Callout,
    DatePicker,
    Flex,
    Icon,
    Link,
    LoadingWheel,
    Modal,
    Text,
} from "@dashdoc/web-ui";
import {formatDate, formatNumber, parseDate, useToggle, yup} from "dashdoc-utils";
import {isBefore} from "date-fns";
import {FormikConfig, FormikProvider, useFormik} from "formik";
import {isNil} from "lodash";
import React, {FunctionComponent, useState} from "react";
import {useDispatch} from "react-redux";

import {InvoicingConnectorErrorText} from "app/features/transport/update-late-transports/InvoicingConnectorErrorText";
import {InvoicingMethodUnknownErrorText} from "app/features/transport/update-late-transports/InvoicingMethodUnknownErrorText";
import {NoInvoicingConnectorErrorText} from "app/features/transport/update-late-transports/no-invoicing-connector-error-text";
import {fetchMarkInvoicesFinalBulk} from "app/redux/actions";
import {SearchQuery} from "app/redux/reducers/searches";
import {EditInvoiceNumberingModal} from "app/taxation/invoicing/features/invoice-settings/EditInvoiceNumberingModal";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";
import {useInvoiceSettings} from "app/taxation/invoicing/hooks/useInvoiceSettings";
import {useInvoicingStatus} from "app/taxation/invoicing/hooks/useInvoicingMethodStatus";
import {useLastInvoicingDate} from "app/taxation/invoicing/hooks/useLastInvoicingDate";
import {getDueDateFromInvoicingDate} from "app/taxation/invoicing/services/invoiceOrCreditNote.service";
import {
    toastFinalizeInvoiceError,
    toastFinalizeInvoiceSuccess,
} from "app/taxation/invoicing/services/invoicingToasts";
import {previewFirstDashdocInvoiceNumber} from "app/taxation/invoicing/services/previewFirstDashdocInvoiceNumber";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

type Props = {
    selectedInvoicesQuery: SearchQuery;
    selectedInvoicesCount?: number;
    invoicingDate?: string | null;
    dueDate?: string | null;
    onClose: () => void;
};

type NotUpdatedInvoice = {
    uid: string;
    document_number?: string;
    price: number;
    debtor_name: string;
    language?: string;
};

export enum FinalizeInvoiceErrorType {
    NegativeInvoiceTotal = "negative_invoice_total",
    MandatoryInvoiceItemException = "mandatory_invoice_item",
    CannotFinalizeEmptyBareInvoice = "cannot_finalize_empty_bare_invoice",
    MissingInvoicingAddress = "missing_invoicing_address",
    MissingLegalMentionsTranslation = "missing_legal_mentions_translation",
    UpsertingCustomerInThirdPartyFailed = "upserting_customer_in_third_party_failed",
    SendingInvoiceToThirdPartyFailed = "sending_invoice_to_third_party_failed",
}

export type BulkFinalizeInvoicesResponse = {
    already_finalized: NotUpdatedInvoice[];
    already_paid: NotUpdatedInvoice[];
    finalized_count: number;
    finalized_invoices: Invoice[];
    not_finalized_count: number;
    not_finalized_errors: Partial<{[errorType in FinalizeInvoiceErrorType]: NotUpdatedInvoice[]}>;
};

export const MarkInvoiceFinalModal: FunctionComponent<Props> = ({
    selectedInvoicesQuery,
    selectedInvoicesCount,
    invoicingDate,
    dueDate,
    onClose,
}) => {
    const dispatch = useDispatch();
    const {
        loading: isFetchingMethodLoading,
        error: hasFetchInvoicingMethodError,
        invoicingStatus,
    } = useInvoicingStatus();
    const invoicingMethodStatus = invoicingStatus ?? {invoicing_method: null};
    const hasDashdocInvoicing = useHasDashdocInvoicingEnabled();
    const {invoiceSettings, updateNumbering} = useInvoiceSettings();
    const [isNumberingModalOpen, openNumberingModal, closeNumberingModal] = useToggle();
    const {isLoading: isFetchingLastInvoicingDate, data: lastInvoicingDateData} =
        useLastInvoicingDate();
    const [isLoading, setIsLoading, setIsNotLoading] = useToggle();
    const isSomethingLoading = isLoading || isFetchingMethodLoading || isFetchingLastInvoicingDate;
    const isMissingInvoicingMethod =
        !isFetchingMethodLoading &&
        !hasFetchInvoicingMethodError &&
        invoicingMethodStatus.invoicing_method === null;
    const connectorIsNotAuthenticated =
        !isFetchingMethodLoading &&
        !hasFetchInvoicingMethodError &&
        invoicingMethodStatus.invoicing_method === "third-party-invoicing" &&
        !invoicingMethodStatus.authentication_details.isAuthenticated;
    const [bulkFinalizeResponse, setBulkFinalizeResponse] = useState<BulkFinalizeInvoicesResponse>(
        {
            already_finalized: [],
            already_paid: [],
            finalized_count: 0,
            finalized_invoices: [],
            not_finalized_count: 0,
            not_finalized_errors: {},
        }
    );
    const [isDone, setDone] = useToggle();
    type FormValues = {
        documentNumber: string | undefined;
        invoicingDate: Date | null;
        dueDate: Date | null;
    };

    const submit = async (values: {
        documentNumber: string;
        invoicingDate: Date;
        dueDate: Date;
    }) => {
        const invoicingDateToSubmit = showInvoicingDate
            ? formatDate(values.invoicingDate, "yyyy-MM-dd")
            : undefined;
        const dueDateToSubmit = showDueDate ? formatDate(values.dueDate, "yyyy-MM-dd") : undefined;
        setIsLoading();
        try {
            const response: BulkFinalizeInvoicesResponse = (
                await fetchMarkInvoicesFinalBulk(
                    selectedInvoicesQuery,
                    values.documentNumber,
                    invoicingDateToSubmit,
                    dueDateToSubmit
                )(dispatch)
            ).response;
            setBulkFinalizeResponse(response);

            const errorCount = Object.keys(response.not_finalized_errors).length;
            if ((errorCount ?? 0) > 0) {
                toastFinalizeInvoiceError(errorCount);
            } else {
                toastFinalizeInvoiceSuccess(response.finalized_count ?? 1);
            }
        } catch (error) {
            try {
                const response = await error.json();
                setBulkFinalizeResponse(response);
            } catch (_) {
                Logger.error("Error while finalizing invoices", error);
                setBulkFinalizeResponse({
                    finalized_invoices: [],
                    finalized_count: 0,
                    already_finalized: [],
                    already_paid: [],
                    not_finalized_count: selectedInvoicesCount ?? 1,
                    not_finalized_errors: {}, // unknown error
                });
            }
            toastFinalizeInvoiceError(selectedInvoicesCount ?? 1);
        } finally {
            setIsNotLoading();
            setDone();
        }
    };

    const showInvoicingDate = invoicingMethodStatus !== undefined;
    const showDueDate = hasDashdocInvoicing && showInvoicingDate;

    const lastInvoiceDateOutsideDashdoc = parseDate(
        invoiceSettings?.numbering_settings?.last_invoice_date_outside_dashdoc
    );

    const firstDashdocInvoice =
        hasDashdocInvoicing && invoiceSettings?.numbering_settings?.editable === true;

    const validationSchema: FormikConfig<FormValues>["validationSchema"] = {};
    if (showInvoicingDate) {
        validationSchema.invoicingDate = yup
            .date()
            .nullable()
            .required(t("common.mandatoryField"));

        if (lastInvoiceDateOutsideDashdoc) {
            validationSchema.invoicingDate = validationSchema.invoicingDate.min(
                lastInvoiceDateOutsideDashdoc,
                t("invoice.markFinalInvoicingDateBeforeLastInvoiceDateOutsideDashdocError", {
                    invoiceDate: formatDate(lastInvoiceDateOutsideDashdoc, "P"),
                })
            );
        }
    }
    if (showDueDate) {
        validationSchema.dueDate = yup
            .date()
            .nullable()
            .required(t("common.mandatoryField"))
            .when(["invoicingDate"], (invoicingDate, schema) => {
                if (invoicingDate) {
                    return schema.min(invoicingDate, t("invoice.dueDateMustBeAfterInvoicingDate"));
                }
                return schema;
            });
    }

    const initialValues = {
        documentNumber: "",
        invoicingDate: invoicingDate ? parseDate(invoicingDate) : new Date(),
        dueDate: dueDate ? parseDate(dueDate) : null,
    };
    if (!initialValues.dueDate && initialValues.invoicingDate) {
        initialValues.dueDate = getDueDateFromInvoicingDate(initialValues.invoicingDate);
    }

    const formik = useFormik<FormValues>({
        initialValues,
        validationSchema: yup.object().shape(validationSchema),
        validateOnBlur: true,
        validateOnChange: true,
        onSubmit: submit,
    });

    const _renderContent = () => {
        if (isSomethingLoading) {
            return <LoadingWheel />;
        }
        if (hasFetchInvoicingMethodError) {
            return <InvoicingMethodUnknownErrorText />;
        }
        if (isMissingInvoicingMethod) {
            return <NoInvoicingConnectorErrorText />;
        }
        if (connectorIsNotAuthenticated) {
            return <InvoicingConnectorErrorText />;
        }

        if (isDone) {
            const errorCount = Object.values(bulkFinalizeResponse.not_finalized_errors).reduce(
                (acc, invoices) => acc + invoices.length,
                0
            );

            return (
                <Box>
                    <Text color="grey.dark" variant="h1">
                        {t("common.processing_completed")}
                    </Text>
                    <Box mt={4} backgroundColor="grey.ultralight" p={4}>
                        <Text variant="h2" mb={2}>
                            {t("common.processing_summary")}
                        </Text>
                        {bulkFinalizeResponse.finalized_count > 0 && (
                            <Flex>
                                <Icon
                                    mr={2}
                                    name="checkCircle"
                                    color="green.dark"
                                    alignSelf="center"
                                />
                                <Text>
                                    {t("invoice.mark_final_modal.finalized_count", {
                                        smart_count: bulkFinalizeResponse.finalized_count,
                                    })}
                                </Text>
                            </Flex>
                        )}
                        {errorCount > 0 && (
                            <>
                                <Flex mb={2}>
                                    <Icon
                                        mr={2}
                                        name="removeCircle"
                                        color="red.dark"
                                        alignSelf="center"
                                    />
                                    <Text>
                                        {t(
                                            Object.keys(bulkFinalizeResponse.not_finalized_errors)
                                                .length === 1
                                                ? "invoice.mark_final_modal.notFinalizedSingleReason"
                                                : "invoice.mark_final_modal.notFinalizedMultipleReasons",
                                            {
                                                smart_count: errorCount,
                                                count: errorCount,
                                            }
                                        )}
                                    </Text>
                                </Flex>
                                <ul data-testid="mark-invoice-final-modal-errors-list">
                                    {Object.entries(bulkFinalizeResponse.not_finalized_errors).map(
                                        ([errorType, invoices]) =>
                                            renderInvoiceErrors(
                                                errorType as FinalizeInvoiceErrorType,
                                                invoices
                                            )
                                    )}
                                </ul>
                            </>
                        )}
                        {bulkFinalizeResponse.already_finalized.length > 0 && (
                            <Box pt={1} mt={1} borderTop={"1px solid"} borderTopColor="grey.light">
                                <Text>
                                    {t("invoice.mark_final_modal.already_finalized", {
                                        smart_count: bulkFinalizeResponse.already_finalized.length,
                                    })}
                                </Text>
                                {renderAlreadyProcessedInvoices(
                                    bulkFinalizeResponse.already_finalized
                                )}
                            </Box>
                        )}
                        {bulkFinalizeResponse.already_paid.length > 0 && (
                            <Box pt={1} mt={1} borderTop={"1px solid"} borderTopColor="grey.light">
                                <Text>
                                    {t("invoice.mark_final_modal.already_paid", {
                                        smart_count: bulkFinalizeResponse.already_paid.length,
                                    })}
                                </Text>
                                {renderAlreadyProcessedInvoices(bulkFinalizeResponse.already_paid)}
                            </Box>
                        )}
                    </Box>
                </Box>
            );
        }

        if (selectedInvoicesCount === 0) {
            return (
                <Flex alignItems="center">
                    <Icon
                        name="warning"
                        color="red.default"
                        round
                        backgroundColor="red.ultralight"
                        mr={2}
                    />
                    <Text>{t("invoice.selectedInvoices", {smart_count: 0})}</Text>
                </Flex>
            );
        }

        return (
            <>
                {!isNil(selectedInvoicesCount) && (
                    <Box
                        ml={-5}
                        pl={5}
                        mr={-5}
                        pr={5}
                        mt={-4}
                        pt={3}
                        pb={3}
                        backgroundColor={"blue.ultralight"}
                    >
                        <Text color="blue.dark" variant="h2">
                            {t("invoice.selectedInvoices", {
                                smart_count: selectedInvoicesCount || 1,
                            })}
                        </Text>
                    </Box>
                )}
                {firstDashdocInvoice ? (
                    <>
                        <Text mt={isNil(selectedInvoicesCount) ? 0 : 3}>
                            {t("invoice.mark_final_warning_first_invoice")}
                        </Text>
                        <Flex
                            my={4}
                            p={3}
                            backgroundColor="grey.ultralight"
                            flexDirection={"column"}
                        >
                            <Flex>
                                <Icon name="alert" />
                                <Text ml={2} variant="h2">
                                    {t("invoice.mark_final_first_invoice_number")}
                                </Text>
                            </Flex>
                            <Flex alignItems={"center"} mt={2}>
                                <Box
                                    p={2}
                                    mr={2}
                                    borderRadius={2}
                                    backgroundColor={"blue.ultralight"}
                                    width={"fit-content"}
                                >
                                    {invoiceSettings?.numbering_settings && (
                                        <Text
                                            color="blue.dark"
                                            variant="title"
                                            mr={3}
                                            data-testid="mark-invoice-final-modal-invoice-number-preview"
                                        >
                                            {t("invoicePdf.documentTitle.final", {
                                                document_number: previewFirstDashdocInvoiceNumber(
                                                    invoiceSettings?.numbering_settings,
                                                    formik.values.invoicingDate
                                                ),
                                            })}
                                        </Text>
                                    )}
                                </Box>
                                <Button variant="plain" onClick={openNumberingModal}>
                                    {t("Invoice.mark_final_update_numbering_settings")}
                                </Button>
                            </Flex>
                        </Flex>
                    </>
                ) : (
                    <>
                        <Text mt={isNil(selectedInvoicesCount) ? 0 : 3}>
                            {t("invoice.mark_final_confirmation_message", {
                                smart_count: selectedInvoicesCount || 1,
                            })}
                        </Text>
                        <Text mt={3} mb={3}>
                            {t("invoice.mark_final_warning_message", {
                                smart_count: selectedInvoicesCount || 1,
                            })}
                        </Text>
                    </>
                )}
                <FormikProvider value={formik}>
                    <form id={"mark-invoice-final-form"} onSubmit={formik.submitForm}>
                        {showInvoicingDate && (
                            <>
                                <Text
                                    mb={3}
                                    variant="h2"
                                    data-testid="mark-invoice-final-modal-header"
                                >
                                    {t("Invoice.mark_final_invoicing_informations")}
                                </Text>
                                <DatePicker
                                    required
                                    clearable
                                    label={t("common.invoicingDate")}
                                    date={formik.values.invoicingDate || null}
                                    onChange={async (date) => {
                                        await formik.setFieldError("invoicingDate", undefined);
                                        await formik.setFieldValue(
                                            "invoicingDate",
                                            date || undefined
                                        );
                                        if (date && showDueDate) {
                                            formik.setFieldValue(
                                                "dueDate",
                                                getDueDateFromInvoicingDate(date)
                                            );
                                        }
                                    }}
                                    data-testid="mark-invoice-final-invoicing-date-picker"
                                    rootId="react-app-modal-root"
                                    error={formik.errors.invoicingDate as string}
                                />
                            </>
                        )}
                        {showDueDate && (
                            <Box mt={3}>
                                <DatePicker
                                    required
                                    clearable
                                    label={t("common.dueDate")}
                                    date={formik.values.dueDate || null}
                                    onChange={(date) => {
                                        formik.setFieldError("dueDate", undefined);
                                        formik.setFieldValue("dueDate", date || undefined);
                                    }}
                                    data-testid="mark-invoice-final-due-date-picker"
                                    rootId="react-app-modal-root"
                                    error={formik.errors.dueDate as string}
                                />
                            </Box>
                        )}
                        <Flex my={3} alignItems="center">
                            <Icon name="info" color="yellow.default" mr={2} />
                            {showDueDate ? (
                                <Text>{t("invoice.doubleCheckInvoicingAndDueDate")}</Text>
                            ) : (
                                <Text>{t("invoice.doubleCheckInvoicingDate")}</Text>
                            )}
                        </Flex>
                    </form>
                    {hasDashdocInvoicing &&
                        !!formik.values.invoicingDate &&
                        !formik.errors.invoicingDate &&
                        !!lastInvoicingDateData?.last_invoicing_date &&
                        isBefore(
                            formik.values.invoicingDate,
                            parseDate(lastInvoicingDateData.last_invoicing_date) as Date
                        ) && (
                            <Callout
                                mt={3}
                                variant="warning"
                                data-testid="mark-invoice-final-modal-invoicing-date-before-last-invoice-date-warning"
                            >
                                <Text>
                                    {t("invoice.markFinalInvoicingDateBeforeLastInvoicingDate", {
                                        invoicingDate: formatDate(
                                            parseDate(lastInvoicingDateData.last_invoicing_date),
                                            "P"
                                        ),
                                    })}
                                </Text>
                                <Text>{t("invoice.markFinalNumberingInconsistency")}</Text>
                            </Callout>
                        )}
                </FormikProvider>
            </>
        );
    };

    function renderAlreadyProcessedInvoices(invoices: NotUpdatedInvoice[]) {
        return invoices.map((invoice, index) => (
            <>
                {index > 0 && ", "}
                {renderInvoiceLink(invoice)}
            </>
        ));
    }

    function renderInvoiceErrors(
        error: FinalizeInvoiceErrorType,
        invoices: NotUpdatedInvoice[] | undefined
    ) {
        if (!invoices || invoices.length === 0) {
            return null;
        }

        const isMissingLegalMentions =
            error === FinalizeInvoiceErrorType.MissingLegalMentionsTranslation;
        const missingLanguages = isMissingLegalMentions
            ? invoices
                  .filter((invoice) => invoice.language)
                  .map((invoice) => `"${ALL_LOCALE_LABELS[invoice.language as Locale]}"`)
            : [];

        const errorMessage =
            error === FinalizeInvoiceErrorType.NegativeInvoiceTotal
                ? t("invoice.markFinalNegativeTotal")
                : error === FinalizeInvoiceErrorType.MandatoryInvoiceItemException
                  ? t("invoice.markFinalMissingInvoiceItem")
                  : error === FinalizeInvoiceErrorType.CannotFinalizeEmptyBareInvoice
                    ? t("invoice.markFinalEmptyBareInvoice")
                    : error === FinalizeInvoiceErrorType.MissingInvoicingAddress
                      ? t("customerToInvoice.notInvoiceable")
                      : isMissingLegalMentions
                        ? t("invoice.markFinalMissingLegalMentionsTranslation", {
                              smart_count: missingLanguages.length,
                              languages: missingLanguages.join(", "),
                          })
                        : error === FinalizeInvoiceErrorType.UpsertingCustomerInThirdPartyFailed ||
                            error === FinalizeInvoiceErrorType.SendingInvoiceToThirdPartyFailed
                          ? t("invoice.markFinalThirdPartyError")
                          : t("invoice.markFinalUnknownError");

        return (
            <li>
                <Text>
                    {errorMessage}
                    &nbsp;{":"}&nbsp;
                    {invoices.map((invoice, index) => (
                        <>
                            {index > 0 && ", "}
                            {renderInvoiceLink(invoice)}
                        </>
                    ))}
                    {isMissingLegalMentions && (
                        <>
                            {". "}
                            <Link
                                onClick={() =>
                                    window.open(`/app/settings/invoice-settings/`, "_blank")
                                }
                            >
                                {t("common.gotosettings")}
                            </Link>
                        </>
                    )}
                </Text>
            </li>
        );
    }

    function renderInvoiceLink(invoice: NotUpdatedInvoice) {
        return (
            <Link onClick={() => window.open(`/app/invoices/${invoice.uid}/`, "_blank")}>
                {invoice.document_number
                    ? invoice.document_number
                    : `${invoice.debtor_name} (${formatNumber(invoice.price, {
                          style: "currency",
                          currency: "EUR",
                      })})`}
            </Link>
        );
    }

    const hasInvoiceMethodError =
        hasFetchInvoicingMethodError || isMissingInvoicingMethod || connectorIsNotAuthenticated;

    const submitDisabled =
        formik.isSubmitting ||
        isLoading ||
        isFetchingMethodLoading ||
        selectedInvoicesCount === 0 ||
        hasInvoiceMethodError;

    return (
        <>
            <Modal
                data-testid="mark-invoice-final-modal"
                title={t("invoice.markFinalConfirmationTitle", {
                    smart_count: selectedInvoicesCount || 1,
                })}
                onClose={onClose}
                mainButton={
                    isDone
                        ? {
                              disabled: false,
                              onClick: onClose,
                              children: t("common.confirmUnderstanding"),
                              "data-testid": "mark-invoice-final-modal-confirm-button",
                          }
                        : {
                              disabled: submitDisabled,
                              onClick: formik.submitForm,
                              children: t("invoice.markFinalConfirmationTitle", {
                                  smart_count: selectedInvoicesCount || 1,
                              }),
                              "data-testid": "mark-invoice-final-modal-submit-button",
                          }
                }
                secondaryButton={isDone ? null : {}}
            >
                {_renderContent()}
            </Modal>
            {isNumberingModalOpen && invoiceSettings && (
                <EditInvoiceNumberingModal
                    onClose={closeNumberingModal}
                    onSubmit={closeNumberingModal}
                    numberingData={invoiceSettings?.numbering_settings}
                    onNumberingEdit={updateNumbering}
                    readOnly={!invoiceSettings?.numbering_settings.editable}
                />
            )}
        </>
    );
};
