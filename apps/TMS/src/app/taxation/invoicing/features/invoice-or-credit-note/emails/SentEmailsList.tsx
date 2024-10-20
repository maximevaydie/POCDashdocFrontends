import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Badge, Flex, Icon, Text} from "@dashdoc/web-ui";
import {communicationStatusService} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate} from "dashdoc-utils";
import React from "react";

import {
    getCreditNoteStatusLabel,
    getInvoiceStatusLabel,
    getStatusBadgeVariant,
} from "app/taxation/invoicing/services/invoiceOrCreditNoteStatus";

import type {
    CreditNoteCommunicationStatus,
    InvoiceCommunicationStatus,
} from "app/taxation/invoicing/types/communicationStatus.types";

type SentEmailsListProps = {
    type: "invoice" | "creditNote";
    communicationStatuses: Required<
        (InvoiceCommunicationStatus | CreditNoteCommunicationStatus)[]
    >;
};

export const SentEmailsList = ({type, communicationStatuses}: SentEmailsListProps) => {
    const timezone = useTimezone();

    const sortedCommunicationStatuses = communicationStatusService.sort(communicationStatuses);

    const statuses = sortedCommunicationStatuses.map((communicationStatus, index) => {
        const isLastEmail = index === sortedCommunicationStatuses.length - 1;
        const {email, status, status_updated_at, email_type} = communicationStatus;
        let itemStatus;
        let label;
        if (type === "invoice") {
            itemStatus = (communicationStatus as InvoiceCommunicationStatus).invoice_status;
            label = itemStatus ? getInvoiceStatusLabel(itemStatus) : null;
        } else {
            itemStatus = (communicationStatus as CreditNoteCommunicationStatus).credit_note_status;
            label = itemStatus ? getCreditNoteStatusLabel(itemStatus) : null;
        }
        return (
            <Flex
                key={email + status_updated_at}
                flexDirection={"column"}
                borderBottom={isLastEmail ? undefined : "1px solid"}
                borderColor="grey.light"
                pb={isLastEmail ? undefined : 3}
            >
                <Text fontWeight={"bold"}>{email}</Text>
                <Flex style={{columnGap: "6px"}} mb={1}>
                    <Text color="grey.dark" mr={2}>
                        {t("common.onDateAtTime", {
                            date: formatDate(parseAndZoneDate(status_updated_at, timezone), "P"),
                            time: formatDate(parseAndZoneDate(status_updated_at, timezone), "p"),
                        }).toLowerCase()}
                    </Text>
                    <EmailCommunicationStatus status={status} />
                </Flex>
                <Flex style={{columnGap: "8px"}}>
                    {itemStatus && (
                        <Badge variant={getStatusBadgeVariant(itemStatus)}>{label}</Badge>
                    )}
                    {email_type === "reminder" && (
                        <Badge variant="purple">{t("common.reminder")}</Badge>
                    )}
                </Flex>
            </Flex>
        );
    });

    return (
        <Flex flexDirection="column" style={{rowGap: "8px"}}>
            <Text pb={1} variant="h1" color="grey.dark">
                {t("common.sentEmails")}
            </Text>
            {statuses.length > 0 ? (
                statuses
            ) : type === "invoice" ? (
                <Text>{t("communicationStatus.noEmailsInvoice")}</Text>
            ) : (
                <Text>{t("communicationStatus.noEmailsCreditNote")}</Text>
            )}
        </Flex>
    );
};

const EmailCommunicationStatus = ({
    status,
}: {
    status: InvoiceCommunicationStatus["status"] | CreditNoteCommunicationStatus["status"];
}) => {
    switch (status) {
        case "delivered":
            return (
                <>
                    <Icon name="checkCircle" color="green.dark" />
                    <Text color="green.dark">{t("communicationStatus.received")}</Text>
                </>
            );
        case "bounced":
            return (
                <>
                    <Icon name="removeCircle" color="red.dark" />
                    <Text color="red.dark">{t("communicationStatus.error")}</Text>
                </>
            );
        case "submitted":
            return (
                <>
                    <Icon name="history" color="blue.dark" />
                    <Text color="blue.dark">{t("communicationStatus.ongoing")}</Text>
                </>
            );
        default:
            return null;
    }
};
