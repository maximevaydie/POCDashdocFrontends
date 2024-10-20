import {t} from "@dashdoc/web-core";
import {Box, Text} from "@dashdoc/web-ui";
import React, {FC, useContext} from "react";

import {AddOrUpdateInvoiceLine} from "app/taxation/invoicing/types/invoice.types";

import {InvoiceOrCreditNoteContext} from "../../contexts/InvoiceOrCreditNoteContext";

import {InvoiceLine} from "./InvoiceLine";

import type {InvoiceLine as InvoiceLineData} from "app/taxation/invoicing/types/invoiceOrCreditNote.types";

export type InvoiceLinesProps = {
    onRemoveInvoiceLine?: (invoiceLineId: InvoiceLineData["id"]) => void;
    onUpdateInvoiceLine?: (
        invoiceLineId: InvoiceLineData["id"],
        newInvoiceLine: AddOrUpdateInvoiceLine
    ) => void;
    hideIfEmpty: boolean;
};

/** The component used to display an invoice line that does not belong to a group */
export const StandaloneInvoiceLines: FC<InvoiceLinesProps> = ({
    onRemoveInvoiceLine,
    onUpdateInvoiceLine,
    hideIfEmpty,
}) => {
    const {invoiceOrCreditNote} = useContext(InvoiceOrCreditNoteContext);
    const isBareInvoice =
        invoiceOrCreditNote !== null &&
        "is_bare_invoice" in invoiceOrCreditNote &&
        invoiceOrCreditNote?.is_bare_invoice;

    if ((!invoiceOrCreditNote || invoiceOrCreditNote.lines.length === 0) && hideIfEmpty) {
        return null;
    }
    return (
        <>
            <Text
                px={4}
                py={2}
                variant="captionBold"
                backgroundColor="blue.ultralight"
                color="blue.dark"
            >
                {isBareInvoice
                    ? t("invoice.invoiceLines")
                    : t("components.invoice.otherInvoiceLines")}
            </Text>
            <Box>
                {invoiceOrCreditNote?.lines.map((line, index) => (
                    <InvoiceLine
                        key={line.id}
                        data-testid={`invoice-line-${index}`}
                        invoiceLine={line}
                        onDelete={
                            line.is_fuel_surcharge
                                ? undefined
                                : () => onRemoveInvoiceLine?.(line.id)
                        }
                        onUpdate={
                            line.is_fuel_surcharge
                                ? undefined
                                : (newInvoiceLine) =>
                                      onUpdateInvoiceLine?.(line.id, newInvoiceLine)
                        }
                    />
                ))}
            </Box>
        </>
    );
};
