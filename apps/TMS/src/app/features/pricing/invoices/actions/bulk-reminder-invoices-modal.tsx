import {SearchQuery, useDispatch} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    Box,
    Flex,
    HorizontalLine,
    Icon,
    Link,
    LoadingWheel,
    Modal,
    Radio,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {formatNumber, useToggle} from "dashdoc-utils";
import React, {useState} from "react";

import {fetchBulkReminderInvoices} from "app/redux/actions";

type BulkReminderInvoicesModalProps = {
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

type BulkReminderInvoicesErrors = {
    no_reminder_contacts_to_share: InvoiceRepresentation[];
    not_finalized: InvoiceRepresentation[];
    already_paid: InvoiceRepresentation[];
};

// To keep in sync with BulkReminderInvoicesOutputSerializer in the backend
type BulkReminderInvoicesResponse = {
    invoices_sending_count: number;
    invoices_not_send_count: number;
    errors: BulkReminderInvoicesErrors;
};

type SendingType = "email_per_invoice" | "email_per_debtor";

export function BulkReminderInvoicesModal({
    selectedInvoicesQuery,
    selectedInvoicesCount,
    onClose,
}: BulkReminderInvoicesModalProps) {
    const dispatch = useDispatch();
    const [sendingType, setSendingType] = useState<SendingType>("email_per_invoice");

    const [bulkReminderInvoiceResponse, setBulkReminderInvoiceResponse] =
        useState<BulkReminderInvoicesResponse>({
            invoices_sending_count: 0,
            invoices_not_send_count: 0,
            errors: {
                no_reminder_contacts_to_share: [],
                not_finalized: [],
                already_paid: [],
            },
        });

    const [isDone, setDone] = useToggle();
    const [isLoading, setIsLoading, setIsNotLoading] = useToggle();

    async function onSubmit() {
        setIsLoading();
        try {
            const bulkReminderInvoicesAction = await dispatch(
                fetchBulkReminderInvoices(selectedInvoicesQuery, {sending_type: sendingType})
            );
            setBulkReminderInvoiceResponse(bulkReminderInvoicesAction.response);
        } catch (error) {
            Logger.error("Error bulk reminder invoices", error);

            const errorJson = await error.json();
            if (
                errorJson.errors?.no_reminder_contacts_to_share ||
                errorJson.errors?.not_finalized ||
                errorJson.errors?.already_paid
            ) {
                setBulkReminderInvoiceResponse(errorJson);
            } else {
                setBulkReminderInvoiceResponse({
                    invoices_sending_count: 0,
                    invoices_not_send_count: selectedInvoicesCount || 1,
                    errors: {
                        no_reminder_contacts_to_share: [],
                        not_finalized: [],
                        already_paid: [],
                    },
                });
            }
        } finally {
            setIsNotLoading();
            setDone();
        }
    }

    function _getInvoiceslinks(contacts: InvoiceRepresentation[]) {
        return contacts.map(({uid, document_number, debtor_name, price}, index) => (
            <>
                {index > 0 && ", "}
                <Link key={uid} onClick={() => window.open(`/app/invoices/${uid}/`, "_blank")}>
                    {document_number
                        ? document_number
                        : `${debtor_name} (${formatNumber(price, {
                              style: "currency",
                              currency: "EUR",
                          })})`}
                </Link>
            </>
        ));
    }

    function _renderContent() {
        if (isLoading) {
            return <LoadingWheel />;
        }
        if (isDone) {
            return (
                <Flex flexDirection="column" css={{gap: "8px"}}>
                    <Text variant="h1" fontWeight={700}>
                        {t("bulkShareInvoice.processing")}
                    </Text>
                    {bulkReminderInvoiceResponse.invoices_sending_count > 0 && (
                        <Flex css={{gap: "8px"}}>
                            <Text>
                                {t("bulkReminderInvoice.xInvoicesSending", {
                                    smart_count:
                                        bulkReminderInvoiceResponse.invoices_sending_count,
                                })}
                            </Text>

                            <TooltipWrapper content={t("bulkShareInvoice.processTooltip")}>
                                <Icon name="questionCircle" color="blue.default" />
                            </TooltipWrapper>
                        </Flex>
                    )}
                    {bulkReminderInvoiceResponse.invoices_not_send_count > 0 && (
                        <Flex
                            backgroundColor="grey.ultralight"
                            flexDirection="column"
                            css={{gap: "8px"}}
                            p={4}
                        >
                            <Text variant="h2">{t("common.problemIdentify")}</Text>
                            <Flex css={{gap: "8px"}}>
                                <Icon name="removeCircle" color="red.default" />
                                <Text>
                                    {t("bulkReminderInvoice.xInvoicesFailed", {
                                        smart_count:
                                            bulkReminderInvoiceResponse.invoices_not_send_count,
                                    })}
                                </Text>
                            </Flex>
                            <HorizontalLine />
                            {bulkReminderInvoiceResponse.errors.not_finalized.length > 0 && (
                                <Flex flexWrap="wrap">
                                    <Text>{t("bulkReminderInvoice.notFinalized")}</Text>
                                    <Text ml={1}>
                                        {_getInvoiceslinks(
                                            bulkReminderInvoiceResponse.errors.not_finalized
                                        )}
                                    </Text>
                                </Flex>
                            )}
                            {bulkReminderInvoiceResponse.errors.already_paid.length > 0 && (
                                <Flex flexWrap="wrap">
                                    <Text>{t("bulkReminderInvoice.alreadyPaid")}</Text>
                                    <Text ml={1}>
                                        {_getInvoiceslinks(
                                            bulkReminderInvoiceResponse.errors.already_paid
                                        )}
                                    </Text>
                                </Flex>
                            )}
                            {bulkReminderInvoiceResponse.errors.no_reminder_contacts_to_share
                                .length > 0 && (
                                <Flex flexWrap="wrap">
                                    <Text>{t("bulkReminderInvoice.noReminderContacts")}</Text>
                                    <Text ml={1}>
                                        {_getInvoiceslinks(
                                            bulkReminderInvoiceResponse.errors
                                                .no_reminder_contacts_to_share
                                        )}
                                    </Text>
                                </Flex>
                            )}
                        </Flex>
                    )}
                </Flex>
            );
        }

        return (
            <Flex flexDirection="column" css={{gap: "16px"}}>
                <Box
                    ml={-5}
                    pl={5}
                    mr={-5}
                    pr={5}
                    mt={-3.5}
                    pt={3}
                    pb={3}
                    backgroundColor={"blue.ultralight"}
                >
                    <Text color="blue.dark" variant="h2">
                        {t("invoice.xSelectedInvoices", {
                            smart_count: selectedInvoicesCount || 0,
                        })}
                    </Text>
                </Box>
                <Text>{t("invoice.bulkReminderInvoicesModalSubtext")}</Text>

                <Text variant="h1" mt={2}>
                    {t("shareInvoice.sendingOptions")}
                </Text>
                <Flex flexDirection={"column"}>
                    <Radio
                        label={t("shareInvoice.emailPerInvoice")}
                        value={"email_per_invoice"}
                        onChange={() => setSendingType("email_per_invoice")}
                        checked={sendingType === "email_per_invoice"}
                    />
                    <Radio
                        label={t("shareInvoice.emailPerDebtor")}
                        value={"email_per_debtor"}
                        onChange={() => setSendingType("email_per_debtor")}
                        checked={sendingType === "email_per_debtor"}
                    />
                </Flex>
            </Flex>
        );
    }

    return (
        <Modal
            data-testid="bulk-reminder-invoices-modal"
            title={t("invoice.bulkReminderInvoicesModalTitle")}
            onClose={onClose}
            mainButton={
                isDone
                    ? {
                          disabled: false,
                          onClick: onClose,
                          children: t("common.confirmUnderstanding"),
                          "data-testid": "bulk-reminder-invoices-final-modal-confirm-button",
                      }
                    : {
                          onClick: onSubmit,
                          children: t("invoice.bulkReminderByEmail"),
                          "data-testid": "bulk-reminder-invoices-modal-submit-button",
                      }
            }
            secondaryButton={
                isDone
                    ? null
                    : {
                          onClick: () => onClose(),
                      }
            }
        >
            {_renderContent()}
        </Modal>
    );
}
