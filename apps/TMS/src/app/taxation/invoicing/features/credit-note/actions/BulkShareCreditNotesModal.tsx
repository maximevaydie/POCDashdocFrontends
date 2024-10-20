import {SearchQuery, useDispatch} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    Text,
    Box,
    Flex,
    Modal,
    LoadingWheel,
    Link,
    TooltipWrapper,
    Icon,
    HorizontalLine,
} from "@dashdoc/web-ui";
import {formatNumber, useToggle} from "dashdoc-utils";
import React, {useState} from "react";

import {fetchBulkShareCreditNotes} from "app/redux/actions";

type BulkShareCreditNotesModalProps = {
    selectedCreditNotesQuery: SearchQuery;
    selectedCreditNotesCount?: number;
    onClose: () => void;
};

type CreditNoteRepresentation = {
    uid: string;
    price: number;
    customer_name: string;
    document_number: string | null;
};

type BulkShareCreditNotesErrors = {
    no_billing_contacts_to_share: CreditNoteRepresentation[];
};

// To keep in sync with BulkShareCreditNotesOutputSerializer in the backend
type BulkShareCreditNotesResponse = {
    credit_notes_sending_count: number;
    credit_notes_not_send_count: number;
    errors: BulkShareCreditNotesErrors;
};

export function BulkShareCreditNotesModal({
    selectedCreditNotesQuery,
    selectedCreditNotesCount,
    onClose,
}: BulkShareCreditNotesModalProps) {
    const dispatch = useDispatch();
    const [bulkShareCreditNotesResponse, setBulkShareCreditNotesResponse] =
        useState<BulkShareCreditNotesResponse>({
            credit_notes_sending_count: 0,
            credit_notes_not_send_count: 0,
            errors: {
                no_billing_contacts_to_share: [],
            },
        });

    const [isDone, setDone] = useToggle();
    const [isLoading, setIsLoading, setIsNotLoading] = useToggle();

    async function onSubmit() {
        setIsLoading();
        try {
            const bulkShareCreditNotesAction = await dispatch(
                fetchBulkShareCreditNotes(selectedCreditNotesQuery)
            );
            setBulkShareCreditNotesResponse(bulkShareCreditNotesAction.response);
        } catch (error) {
            Logger.error("Error bulk share credit notes", error);

            const errorJson = await error.json();
            if (errorJson.errors?.no_billing_contacts_to_share) {
                setBulkShareCreditNotesResponse(errorJson);
            } else {
                setBulkShareCreditNotesResponse({
                    credit_notes_not_send_count: 0,
                    credit_notes_sending_count: selectedCreditNotesCount || 1,
                    errors: {
                        no_billing_contacts_to_share: [],
                    },
                });
            }
        } finally {
            setIsNotLoading();
            setDone();
        }
    }

    function _renderContent() {
        if (isLoading) {
            return <LoadingWheel />;
        }

        if (isDone) {
            const nonSendCreditNotesLinks =
                bulkShareCreditNotesResponse.errors.no_billing_contacts_to_share.map(
                    ({uid, document_number, customer_name, price}, index) => (
                        <>
                            {index > 0 && ", "}
                            <Link
                                key={uid}
                                onClick={() => window.open(`/app/credit-notes/${uid}/`, "_blank")}
                            >
                                {document_number
                                    ? document_number
                                    : `${customer_name} (${formatNumber(price, {
                                          style: "currency",
                                          currency: "EUR",
                                      })})`}
                            </Link>
                        </>
                    )
                );

            return (
                <Flex flexDirection="column" css={{gap: "8px"}}>
                    <Text variant="h1" fontWeight={700}>
                        {t("bulkShareInvoice.processing")}
                    </Text>
                    {bulkShareCreditNotesResponse.credit_notes_sending_count > 0 && (
                        <Flex css={{gap: "8px"}}>
                            <Text>
                                {t("bulkShareCreditNote.xCreditNotesSending", {
                                    smart_count:
                                        bulkShareCreditNotesResponse.credit_notes_sending_count,
                                })}
                            </Text>

                            <TooltipWrapper content={t("bulkShareCreditNote.processTooltip")}>
                                <Icon name="questionCircle" color="blue.default" />
                            </TooltipWrapper>
                        </Flex>
                    )}
                    {bulkShareCreditNotesResponse.credit_notes_not_send_count > 0 && (
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
                                    {t("bulkShareCreditNote.xCreditNotesFailed", {
                                        smart_count:
                                            bulkShareCreditNotesResponse.credit_notes_not_send_count,
                                    })}
                                </Text>
                            </Flex>
                            <HorizontalLine />
                            <Flex flexWrap="wrap">
                                <Text>{t("bulkShareCreditNote.noBillingContacts")}</Text>
                                <Text ml={1}>{nonSendCreditNotesLinks}</Text>
                            </Flex>
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
                        {t("invoice.xSelectedCreditNotes", {
                            smart_count: selectedCreditNotesCount || 0,
                        })}
                    </Text>
                </Box>
                <Text>{t("invoice.bulkShareCreditNotesModalSubtext")}</Text>
            </Flex>
        );
    }

    return (
        <Modal
            data-testid="bulk-share-credit-notes-modal"
            title={t("invoice.bulkShareCreditNotesModalTitle")}
            onClose={onClose}
            mainButton={
                isDone
                    ? {
                          disabled: false,
                          onClick: onClose,
                          children: t("common.confirmUnderstanding"),
                          "data-testid": "bulk-share-credit-notes-final-modal-confirm-button",
                      }
                    : {
                          onClick: onSubmit,
                          children: t("common.sendViaEmail"),
                          "data-testid": "bulk-share-credit-notes-modal-submit-button",
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
