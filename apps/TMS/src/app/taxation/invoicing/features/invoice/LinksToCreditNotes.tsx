import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Badge, Box, Card, ClickableFlex, Flex, Icon, Text} from "@dashdoc/web-ui";
import {LastEmailStatus} from "@dashdoc/web-ui";
import {formatDate, formatNumber, parseAndZoneDate} from "dashdoc-utils";
import React from "react";
import {useHistory} from "react-router";

import type {CreditNoteLink, Invoice} from "app/taxation/invoicing/types/invoice.types";

export function LinksToCreditNotes({
    invoice,
    onEditCreditNote,
    fromSharing = false,
}: {
    invoice: Invoice;
    onEditCreditNote?: (uid: string) => void;
    fromSharing?: boolean;
}) {
    if (!invoice.credit_notes || invoice.credit_notes.length === 0) {
        return null;
    }

    return (
        <Card px={4} py={3} mb={4} backgroundColor={"blue.ultralight"} boxShadow={"none"}>
            <Text mb={2} variant="h2">
                {t("invoice.detail.nbOfCreditNotes", {smart_count: invoice.credit_notes.length})}
            </Text>

            {invoice.credit_notes.map((creditNote) => (
                <CreditNoteLine
                    key={creditNote.uid}
                    creditNote={creditNote}
                    onEditCreditNote={onEditCreditNote}
                    fromSharing={fromSharing}
                />
            ))}
        </Card>
    );
}

function CreditNoteLine({
    creditNote,
    onEditCreditNote,
    fromSharing,
}: {
    creditNote: CreditNoteLink;
    onEditCreditNote?: (uid: string) => void;
    fromSharing: boolean;
}) {
    const history = useHistory();
    const timezone = useTimezone();

    return (
        <ClickableFlex
            onClick={goToCreditNote}
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            mt={2}
            px={4}
            py={3}
            data-testid="link-to-credit-note"
            borderBottom="1px solid"
            borderTop="1px solid"
            borderColor="grey.light"
            backgroundColor={"grey.white"}
        >
            <Box ml={2}>
                <Flex alignItems="center">
                    <Text mr={2}>
                        {creditNote.document_number
                            ? t("fullCreditNoteDetails.documentNumber", {
                                  number: creditNote.document_number,
                              })
                            : t("common.creditNoteTotal")}
                    </Text>
                    {getStatusBadge()}
                </Flex>
                <Flex alignItems="center">
                    <Text color="grey.dark" variant="caption" lineHeight={1}>
                        {t("common.creditNoteCreatedOnDate", {
                            date: formatDate(parseAndZoneDate(creditNote.created, timezone), "P"),
                        })}
                    </Text>
                    {!fromSharing && creditNote.communication_statuses?.length > 0 && (
                        <Flex alignItems="center">
                            <Text color="grey.dark" variant="caption" lineHeight={1} mx={1}>
                                -
                            </Text>
                            <LastEmailStatus
                                communicationStatuses={creditNote.communication_statuses}
                                timezone={timezone}
                            />
                        </Flex>
                    )}
                </Flex>
            </Box>
            <Flex>
                <Flex px={2} py={1} alignItems="center" backgroundColor="red.ultralight">
                    <Text fontWeight="bold" color="red.dark">
                        {t("common.priceWithoutTaxes", {
                            price: formatNumber(creditNote.total_tax_free_amount, {
                                style: "currency",
                                currency: "EUR",
                            }),
                        })}
                    </Text>
                </Flex>
                <Icon name="arrowRight" ml={3} />
            </Flex>
        </ClickableFlex>
    );

    function getStatusBadge() {
        switch (creditNote.status) {
            case "draft":
                return (
                    <Badge variant="neutral" fontSize={1}>
                        {t("creditNote.status.draft")}
                    </Badge>
                );
            case "final":
                return (
                    <Badge variant="blue" fontSize={1}>
                        {t("creditNote.status.final")}
                    </Badge>
                );
            case "paid":
                return (
                    <Badge variant="success" fontSize={1}>
                        {t("creditNote.status.paid")}
                    </Badge>
                );
            default:
                return null;
        }
    }

    function goToCreditNote() {
        if (fromSharing) {
            history.push(`/shared-credit-notes/${creditNote.uid}`);
        } else if (onEditCreditNote) {
            onEditCreditNote(creditNote.uid);
        } else {
            history.push(`/app/credit-notes/${creditNote.uid}`);
        }
    }
}
