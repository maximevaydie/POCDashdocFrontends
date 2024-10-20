import {useToggle} from "dashdoc-utils";
import React, {createContext, ReactNode, useContext} from "react";

import {connectorsService} from "app/services/invoicing";

import {invoiceLineService} from "../lines/invoice-line-groups/invoiceLine.service";

import {InvoiceOrCreditNoteContext} from "./InvoiceOrCreditNoteContext";

import type {Invoice} from "app/taxation/invoicing/types/invoice.types";

interface Context {
    canGroupUngroup: boolean;
    canMergeByAllGroups: boolean;
    isGrouped: boolean;
    group: () => void;
    ungroup: () => void;
}
const initialContext: Context = {
    canGroupUngroup: false,
    canMergeByAllGroups: false,
    isGrouped: false,
    group: () => {},
    ungroup: () => {},
};

/**
 * A context to store the group/ungroup invoice state and a way to group/ungroup.
 *
 * Usage in a child component:
 * ```
 * const {...} = useContext(GroupUngroupContext);
 * ```
 */
export const GroupUngroupContext = createContext(initialContext);

export function GroupUngroupContextProvider({children}: {children: ReactNode}) {
    const {invoiceOrCreditNote} = useContext(InvoiceOrCreditNoteContext);
    const invoice = invoiceOrCreditNote as Invoice; // context used only used for invoice
    const invoiceIsMergedByAllGroups = invoiceLineService.isMergedByAllGroups(invoice);
    const [isGrouped, group, ungroup] = useToggle(invoiceIsMergedByAllGroups);

    const hasInvoicingConnectorWithMerge =
        invoice.invoicing_connector &&
        connectorsService.canMergeByAllGroups(invoice.invoicing_connector);

    const canMergeByAllGroups = hasInvoicingConnectorWithMerge || invoice.is_dashdoc;

    // We can group an invoice when the connector is compatible and the invoice is merged.
    const canGroupUngroup = canMergeByAllGroups && invoiceIsMergedByAllGroups;
    const value: Context = {
        canGroupUngroup,
        canMergeByAllGroups,
        isGrouped: canGroupUngroup ? isGrouped : false,
        group,
        ungroup,
    };

    return <GroupUngroupContext.Provider value={value}>{children}</GroupUngroupContext.Provider>;
}
