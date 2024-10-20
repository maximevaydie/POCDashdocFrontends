import {getCompanySetting, useSelector} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    Flex,
    HorizontalLine,
    Icon,
    Link,
    LoadingWheel,
    Modal,
    Text,
} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import {formatNumber, useToggle} from "dashdoc-utils";
import {isNil} from "lodash";
import React, {FunctionComponent, useState} from "react";
import {useForm} from "react-hook-form";
import {useDispatch} from "react-redux";

import {
    TrackingInvoicePaymentFormType,
    TrackingInvoicePaymentForm,
} from "app/features/pricing/invoices/TrackingInvoicePaymentForm";
import {fetchMarkInvoicesPaidBulk} from "app/redux/actions";
import {SearchQuery} from "app/redux/reducers/searches";
import {
    formatTrackingInvoicePaymentPayload,
    trackingInvoicePaymentSchema,
} from "app/services/invoicing/paymentMethod.service";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

type BulkMarkInvoicesPaidModalProps = {
    selectedInvoicesQuery: SearchQuery;
    selectedInvoicesCount?: number;
    onClose: () => void;
};

type InvoiceIds = {
    uid: string;
    document_number?: string;
    price: number;
    debtor_name: string;
};

export type BulkMarkedPaidInvoicesResponse = {
    marked_paid_invoices: Invoice[];
    marked_paid_count: number;
    not_marked_paid_count: number;
    already_paid: InvoiceIds[];
    still_draft: InvoiceIds[];
};

export const BulkMarkInvoicesPaidModal: FunctionComponent<BulkMarkInvoicesPaidModalProps> = ({
    selectedInvoicesQuery,
    selectedInvoicesCount,
    onClose,
}) => {
    const [isLoading, setIsLoading, setIsNotLoading] = useToggle();
    const initBulkMarkPaidResponse = {
        marked_paid_invoices: [],
        marked_paid_count: 0,
        not_marked_paid_count: 0,
        already_paid: [],
        still_draft: [],
    };
    const [bulkMarkPaidResponse, setBulkMarkPaidResponse] =
        useState<BulkMarkedPaidInvoicesResponse>(initBulkMarkPaidResponse);
    const [isDone, setDone] = useToggle();
    const dispatch = useDispatch();
    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();
    const invoicePaymentSetting = useSelector((state) =>
        getCompanySetting(state, "invoice_payment")
    );

    const onSubmit = async (payload: TrackingInvoicePaymentFormType) => {
        setIsLoading();
        try {
            const formattedPayload = formatTrackingInvoicePaymentPayload(payload);
            const bulkMarkPaidAction = await fetchMarkInvoicesPaidBulk(
                selectedInvoicesQuery,
                formattedPayload
            )(dispatch);
            setBulkMarkPaidResponse(bulkMarkPaidAction.response);
        } catch (error) {
            Logger.error("Error while marking paid invoices", error);
            const bulkMarkPaidResponseError: BulkMarkedPaidInvoicesResponse = {
                marked_paid_invoices: [],
                marked_paid_count: 0,
                not_marked_paid_count: selectedInvoicesCount || 1,
                already_paid: [],
                still_draft: [],
            };
            setBulkMarkPaidResponse(bulkMarkPaidResponseError);
        } finally {
            setIsNotLoading();
            setDone();
        }
    };

    const form = useForm<TrackingInvoicePaymentFormType>({
        defaultValues: {
            paid_at: undefined,
            payment_method: undefined,
            payment_notes: undefined,
        },
        resolver: zodResolver(trackingInvoicePaymentSchema),
    });

    const {
        handleSubmit,
        formState: {isSubmitting},
    } = form;

    const _renderContent = () => {
        if (isLoading) {
            return <LoadingWheel />;
        }

        if (isDone) {
            const alreadyPaidLinks = bulkMarkPaidResponse.already_paid.map(
                ({uid, document_number, debtor_name, price}, index) => (
                    <>
                        {index > 0 && ", "}
                        <Link onClick={() => window.open(`/app/invoices/${uid}/`, "_blank")}>
                            {document_number
                                ? document_number
                                : `${debtor_name} (${formatNumber(price, {
                                      style: "currency",
                                      currency: "EUR",
                                  })})`}
                        </Link>
                    </>
                )
            );
            const stillDraftLinks = bulkMarkPaidResponse.still_draft.map(
                ({uid, document_number, debtor_name, price}, index) => (
                    <>
                        {index > 0 && ", "}
                        <Link onClick={() => window.open(`/app/invoices/${uid}/`, "_blank")}>
                            {document_number
                                ? document_number
                                : `${debtor_name} (${formatNumber(price, {
                                      style: "currency",
                                      currency: "EUR",
                                  })})`}
                        </Link>
                    </>
                )
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
                        {bulkMarkPaidResponse.marked_paid_count > 0 && (
                            <Flex>
                                <Icon
                                    mr={2}
                                    name="checkCircle"
                                    color="green.dark"
                                    alignSelf="center"
                                />
                                <Text>
                                    {t("invoice.mark_paid_modal.marked_paid_count", {
                                        smart_count: bulkMarkPaidResponse.marked_paid_count,
                                    })}
                                </Text>
                            </Flex>
                        )}
                        {bulkMarkPaidResponse.not_marked_paid_count > 0 && (
                            <Flex mb={2}>
                                <Icon
                                    mr={2}
                                    name="removeCircle"
                                    color="red.dark"
                                    alignSelf="center"
                                />
                                <Text>
                                    {t("invoice.mark_paid_modal.not_marked_paid_count", {
                                        smart_count: bulkMarkPaidResponse.not_marked_paid_count,
                                    })}
                                </Text>
                            </Flex>
                        )}
                        {bulkMarkPaidResponse.already_paid.length > 0 && (
                            <Box pt={1} mt={1} borderTop={"1px solid"} borderTopColor="grey.light">
                                <Text>
                                    {t("invoice.mark_paid_modal.already_paid", {
                                        smart_count: bulkMarkPaidResponse.already_paid.length,
                                    })}
                                </Text>
                                {alreadyPaidLinks}
                            </Box>
                        )}
                        {bulkMarkPaidResponse.still_draft.length > 0 && (
                            <Box pt={1} mt={1} borderTop={"1px solid"} borderTopColor="grey.light">
                                <Text>
                                    {t("invoice.mark_paid_modal.still_draft", {
                                        smart_count: bulkMarkPaidResponse.still_draft.length,
                                    })}
                                </Text>
                                {stillDraftLinks}
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
                {hasDashdocInvoicingEnabled && invoicePaymentSetting ? (
                    <>
                        <Text mt={3}>
                            {t("invoice.informationWillNotBeVisibleToTheCustomersToInvoice", {
                                smart_count: selectedInvoicesCount || 1,
                            })}
                        </Text>
                        <TrackingInvoicePaymentForm form={form} />
                        <Callout iconDisabled mt={3}>
                            <Text>{t("invoice.byValidatingThisActionPaymentInformation")}</Text>
                            <HorizontalLine />
                            <Flex mt={3}>
                                <Icon
                                    mr={2}
                                    name="checkCircle"
                                    color="green.default"
                                    alignSelf="center"
                                />
                                <Text>{t("invoice.willApplyToFinalizedInvoices")}</Text>
                            </Flex>
                            <Flex mt={3}>
                                <Icon
                                    mr={2}
                                    name="checkCircle"
                                    color="green.default"
                                    alignSelf="center"
                                />
                                <Text>
                                    {t(
                                        "invoice.replaceExistingInformationOnInvoicesAlreadyMarkedPaid"
                                    )}
                                </Text>
                            </Flex>
                            <Flex mt={3}>
                                <Icon
                                    mr={2}
                                    name="removeCircle"
                                    color="red.default"
                                    alignSelf="center"
                                />
                                <Text>{t("invoice.willNotApplyToDraftInvoices")}</Text>
                            </Flex>
                        </Callout>
                    </>
                ) : (
                    <Text mt={3}>
                        {t("invoice.mark_paid_confirmation_message", {
                            smart_count: selectedInvoicesCount || 1,
                        })}
                    </Text>
                )}
            </>
        );
    };

    const submitDisabled = isSubmitting || isLoading || selectedInvoicesCount === 0;

    return (
        <Modal
            data-testid="mark-invoice-paid-modal"
            title={t("invoice.markPaidConfirmationTitle", {
                smart_count: selectedInvoicesCount || 1,
            })}
            onClose={onClose}
            mainButton={
                isDone
                    ? {
                          disabled: false,
                          onClick: onClose,
                          children: t("common.confirmUnderstanding"),
                          "data-testid": "mark-invoice-paid-modal-confirm-button",
                      }
                    : {
                          disabled: submitDisabled,
                          onClick: handleSubmit(onSubmit),
                          children: t("invoice.markPaidConfirmationTitle", {
                              smart_count: selectedInvoicesCount || 1,
                          }),
                          "data-testid": "mark-invoice-paid-modal-submit-button",
                      }
            }
            secondaryButton={isDone ? null : {}}
        >
            {_renderContent()}
        </Modal>
    );
};
