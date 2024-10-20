import {t} from "@dashdoc/web-core";
import {Badge, Flex} from "@dashdoc/web-ui";
import React from "react";

import {getCreditNotesByStatus} from "app/services/invoicing/invoice.service";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

export function InvoiceCreditedStatusBadges({invoice}: {invoice: Invoice}) {
    return (
        <Flex data-testid="credit-note-header-status">
            {getCreditNotesByStatus(invoice, ["draft"]).length > 0 && (
                <Badge variant="neutral">{t("common.draftCreditNote")}</Badge>
            )}
            {getCreditNotesByStatus(invoice, ["final"]).length > 0 && (
                <Badge variant="blue">{t("common.finalCreditNote")}</Badge>
            )}
            {getCreditNotesByStatus(invoice, ["paid"]).length > 0 && (
                <Badge variant="success">{t("common.paidCreditNote")}</Badge>
            )}
        </Flex>
    );
}
