import {SearchQuery, useDispatch} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Box, Callout, Flex, Icon, Link, LoadingWheel, Modal, Text} from "@dashdoc/web-ui";
import {formatNumber, useToggle} from "dashdoc-utils";
import isNil from "lodash.isnil";
import React, {useState} from "react";

import {fetchBulkDuplicateInvoices} from "app/redux/actions";
import {useRefreshInvoices} from "app/taxation/invoicing/hooks/useRefreshInvoices";

type Props = {
    selectedInvoicesQuery: SearchQuery;
    selectedInvoicesCount?: number;
    onClose: () => void;
};

type InvoiceRepresentation = {
    uid: string;
    price: number;
    debtor_name: string;
    document_number: string | null;
};

type BulkDuplicateInvoicesErrors = {
    cannot_duplicate_non_bare_invoice: InvoiceRepresentation[];
};

// To keep in syunc with BulkDuplicateInvoicesOutputSerializer in the backend
type BulkDuplicateInvoicesResponse = {
    invoices_duplicated_count: number;
    invoices_not_duplicated_count: number;
    errors: BulkDuplicateInvoicesErrors;
};

export function BulkDuplicateInvoicesModal({
    selectedInvoicesQuery,
    selectedInvoicesCount,
    onClose,
}: Props) {
    const refreshInvoices = useRefreshInvoices();

    const [isLoading, setIsLoading, setIsNotLoading] = useToggle();
    const initBulkDuplicateInvoiceResponse = {
        invoices_duplicated_count: 0,
        invoices_not_duplicated_count: 0,
        errors: {
            cannot_duplicate_non_bare_invoice: [],
        },
    };
    const [bulkDuplicateInvoiceResponse, setBulkDuplicateInvoiceResponse] =
        useState<BulkDuplicateInvoicesResponse>(initBulkDuplicateInvoiceResponse);

    const [isDone, setDone] = useToggle();
    const dispatch = useDispatch();

    const onSubmit = async () => {
        setIsLoading();
        try {
            const bulkDuplicateInvoiceAction =
                await fetchBulkDuplicateInvoices(selectedInvoicesQuery)(dispatch);
            setBulkDuplicateInvoiceResponse(bulkDuplicateInvoiceAction.response);
            refreshInvoices();
        } catch (error) {
            const errorJson = await error.json();
            if (errorJson.errors?.cannot_duplicate_non_bare_invoice) {
                setBulkDuplicateInvoiceResponse(errorJson);
            } else {
                Logger.error("Error bulk duplicating invoices", error);
                setBulkDuplicateInvoiceResponse({
                    invoices_duplicated_count: 0,
                    invoices_not_duplicated_count: selectedInvoicesCount || 1,
                    errors: {
                        cannot_duplicate_non_bare_invoice: [],
                    },
                });
            }
        } finally {
            setIsNotLoading();
            setDone();
        }
    };

    const _renderContent = () => {
        if (isLoading) {
            return <LoadingWheel />;
        }

        if (isDone) {
            const nonBareInvoicesLinks =
                bulkDuplicateInvoiceResponse.errors.cannot_duplicate_non_bare_invoice.map(
                    ({uid, document_number, debtor_name, price}, index) => (
                        <>
                            {index > 0 && ", "}
                            <Link
                                key={uid}
                                onClick={() => window.open(`/app/invoices/${uid}/`, "_blank")}
                            >
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
                        {bulkDuplicateInvoiceResponse.invoices_duplicated_count > 0 && (
                            <Flex>
                                <Icon
                                    mr={2}
                                    name="checkCircle"
                                    color="green.dark"
                                    alignSelf="center"
                                />
                                <Text>
                                    {t(
                                        "invoice.bulkDuplicateInvoicesModal.invoicesDuplicatedCount",
                                        {
                                            smart_count:
                                                bulkDuplicateInvoiceResponse.invoices_duplicated_count,
                                        }
                                    )}
                                </Text>
                            </Flex>
                        )}
                        {bulkDuplicateInvoiceResponse.invoices_not_duplicated_count > 0 && (
                            <Flex mb={2}>
                                <Icon
                                    mr={2}
                                    name="removeCircle"
                                    color="red.dark"
                                    alignSelf="center"
                                />
                                <Text>
                                    {t(
                                        "invoice.bulkDuplicateInvoicesModal.invoicesNotDuplicatedCount",
                                        {
                                            smart_count:
                                                bulkDuplicateInvoiceResponse.invoices_not_duplicated_count,
                                        }
                                    )}
                                </Text>
                            </Flex>
                        )}
                        {bulkDuplicateInvoiceResponse.errors.cannot_duplicate_non_bare_invoice
                            .length > 0 && (
                            <Box pt={1} mt={1} borderTop={"1px solid"} borderTopColor="grey.light">
                                <Text>
                                    {t(
                                        "invoice.bulkDuplicateInvoicesModal.invoicesWithTransports",
                                        {
                                            smart_count:
                                                bulkDuplicateInvoiceResponse.errors
                                                    .cannot_duplicate_non_bare_invoice.length,
                                        }
                                    )}
                                </Text>
                                {nonBareInvoicesLinks}
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
                <Text mt={3}>
                    {t("invoice.bulkDuplicateInvoicesModal.duplicateInvoicesConfirmationMessage", {
                        smart_count: selectedInvoicesCount || 1,
                    })}
                </Text>
                <Callout mt={3} variant="informative">
                    {t("invoice.bulkDuplicateInvoicesModal.duplicateInvoicesWarning")}
                </Callout>
            </>
        );
    };

    const submitDisabled = isLoading || selectedInvoicesCount === 0;

    return (
        <Modal
            data-testid="bulk-duplicate-invoices-modal"
            title={t("invoice.bulkDuplicateInvoicesModal.duplicateInvoices", {
                smart_count: selectedInvoicesCount || 1,
            })}
            onClose={onClose}
            mainButton={
                isDone
                    ? {
                          disabled: false,
                          onClick: onClose,
                          children: t("common.confirmUnderstanding"),
                          "data-testid": "bulk-duplicate-invoices-modal-confirm-button",
                      }
                    : {
                          disabled: submitDisabled,
                          onClick: onSubmit,
                          children: t("invoice.bulkDuplicateInvoicesModal.duplicateInvoices", {
                              smart_count: selectedInvoicesCount || 1,
                          }),
                          "data-testid": "bulk-duplicate-invoices-modal-submit-button",
                      }
            }
            secondaryButton={isDone ? null : {}}
        >
            {_renderContent()}
        </Modal>
    );
}
