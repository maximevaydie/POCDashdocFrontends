import {t} from "@dashdoc/web-core";
import {TooltipWrapper} from "@dashdoc/web-ui";
import {EmailsRecapIcons} from "@dashdoc/web-ui";
import React from "react";

import {InvoiceEmailsListTooltip} from "app/taxation/invoicing/features/invoice-or-credit-note/emails/InvoiceEmailsListTooltip";

import type {
    CreditNoteCommunicationStatus,
    InvoiceCommunicationStatus,
    InvoiceEmailType,
} from "app/taxation/invoicing/types/communicationStatus.types";

type SharedEmailsRecapProps = {
    communicationStatuses: (InvoiceCommunicationStatus | CreditNoteCommunicationStatus)[];
    email_type: InvoiceEmailType;
};

export const EmailsRecap = ({communicationStatuses, email_type}: SharedEmailsRecapProps) => {
    const sharedEmailsCommunicationStatuses = communicationStatuses.filter(
        (communicationStatus) => {
            if (email_type === "share") {
                return (
                    communicationStatus.email_type === null ||
                    communicationStatus.email_type === "share"
                );
            }
            return communicationStatus.email_type === email_type;
        }
    );

    return (
        <TooltipWrapper
            placement="right"
            content={
                <InvoiceEmailsListTooltip
                    communicationStatuses={sharedEmailsCommunicationStatuses}
                    title={
                        email_type === "share"
                            ? t("invoices.sharingEmails")
                            : t("invoices.reminderEmails")
                    }
                />
            }
        >
            <EmailsRecapIcons communicationStatuses={sharedEmailsCommunicationStatuses} />
        </TooltipWrapper>
    );
};
