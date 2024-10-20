import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Badge} from "@dashdoc/web-ui";
import {
    EmailsListTooltip,
    EmailsListTooltipItem,
    communicationStatusService,
} from "@dashdoc/web-ui";
import React from "react";

import {
    getInvoiceStatusLabel,
    getStatusBadgeVariant,
} from "app/taxation/invoicing/services/invoiceOrCreditNoteStatus";

import type {
    CreditNoteCommunicationStatus,
    InvoiceCommunicationStatus,
} from "app/taxation/invoicing/types/communicationStatus.types";

type Props = {
    title: string;
    communicationStatuses: (InvoiceCommunicationStatus | CreditNoteCommunicationStatus)[];
};
export const InvoiceEmailsListTooltip = ({title, communicationStatuses}: Props) => {
    const timezone = useTimezone();

    const sortedCommunicationStatuses = communicationStatusService.sort(communicationStatuses);
    return (
        <EmailsListTooltip title={title} noEmailLabel={t("communicationStatus.noEmailsInvoice")}>
            {sortedCommunicationStatuses.map((communicationStatus) => (
                <EmailsListTooltipItem
                    key={communicationStatus.pk}
                    communicationStatus={communicationStatus}
                    timezone={timezone}
                >
                    <AdditionalLabel status={communicationStatus} />
                </EmailsListTooltipItem>
            ))}
        </EmailsListTooltip>
    );
};

function AdditionalLabel({
    status,
}: {
    status: InvoiceCommunicationStatus | CreditNoteCommunicationStatus;
}) {
    let itemStatus = null;

    if ("invoice_status" in status) {
        itemStatus = status.invoice_status;
    } else if ("credit_note_status" in status) {
        itemStatus = status.credit_note_status;
    }

    if (!itemStatus) {
        return null;
    }
    const label = getInvoiceStatusLabel(itemStatus);
    return <Badge variant={getStatusBadgeVariant(itemStatus)}>{label}</Badge>;
}
