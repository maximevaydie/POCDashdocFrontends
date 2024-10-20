import {Logger} from "@dashdoc/web-core";
import {useToggle} from "dashdoc-utils";
import React, {createContext, FC, useState} from "react";

import {fetchUpdateMergeBy} from "app/redux/actions/invoices";
import {useDispatch} from "app/redux/hooks";
import {
    validateCreditNoteOrRaise,
    type CreditNote,
} from "app/taxation/invoicing/types/creditNote.types";

import type {Invoice, PatchInvoiceMergeBy} from "app/taxation/invoicing/types/invoice.types";

type UpdateGroupByProps = {
    payload: PatchInvoiceMergeBy;
    onSuccess: () => void;
};
interface InvoiceOrCreditNoteContextType {
    invoiceOrCreditNote: Invoice | CreditNote | null;
    isSubmitting: boolean;
    fromSharing: boolean;
    readOnly: boolean;
    isMergeByErrorModalOpen: boolean;
    updateGroupBy: (props: UpdateGroupByProps) => Promise<void>;
    clearError: () => void;
}
const initialContext: InvoiceOrCreditNoteContextType = {
    invoiceOrCreditNote: null,
    isSubmitting: false,
    fromSharing: false,
    readOnly: false,
    isMergeByErrorModalOpen: false,
    updateGroupBy: () => Promise.resolve(),
    clearError: () => {},
};

/**
 * A context to store the invoice state.
 *
 * Usage in a child component:
 * ```
 * const {...} = useContext(InvoiceContext);
 * ```
 */
export const InvoiceOrCreditNoteContext = createContext(initialContext);

type InvoiceContextProviderProps = {
    invoice: Invoice;
    fromSharing: boolean;
    children: React.ReactNode;
};
export const InvoiceContextProvider: FC<InvoiceContextProviderProps> = ({
    invoice,
    fromSharing,
    children,
}) => {
    const dispatch = useDispatch();
    const [isSubmittingMergingInfo, setSubmittingMergingInfo, setSubmittedMergingInfo] =
        useToggle();
    const [isMergeByErrorModalOpen, setIsMergeByErrorModalOpen] = useState<boolean>(false);
    const updateGroupBy = async ({payload, onSuccess}: UpdateGroupByProps) => {
        setSubmittingMergingInfo();
        try {
            await dispatch(fetchUpdateMergeBy(invoice.uid, payload));
            onSuccess();
        } catch (e) {
            await Logger.getError<{
                non_field_errors: {code: string[]; detail: string[]};
            }>(e);
            setIsMergeByErrorModalOpen(true);
        } finally {
            setSubmittedMergingInfo();
        }
    };

    const readOnly = isSubmittingMergingInfo || fromSharing || invoice.status !== "draft";

    return (
        <InvoiceOrCreditNoteContext.Provider
            value={{
                invoiceOrCreditNote: invoice,
                fromSharing,
                isSubmitting: isSubmittingMergingInfo,
                readOnly,
                isMergeByErrorModalOpen,
                updateGroupBy,
                clearError: () => setIsMergeByErrorModalOpen(false),
            }}
        >
            {children}
        </InvoiceOrCreditNoteContext.Provider>
    );
};

type CreditNoteContextProviderProps = {
    creditNote: CreditNote;
    fromSharing: boolean;
    children: React.ReactNode;
};
export const CreditNoteContextProvider: FC<CreditNoteContextProviderProps> = ({
    creditNote,
    fromSharing,
    children,
}) => {
    return (
        <InvoiceOrCreditNoteContext.Provider
            value={{
                invoiceOrCreditNote: creditNote,
                fromSharing,
                isSubmitting: false,
                readOnly: !creditNote.is_bare_credit_note || creditNote.status !== "draft",
                isMergeByErrorModalOpen: false,
                updateGroupBy: () => Promise.resolve(),
                clearError: () => {},
            }}
        >
            {children}
        </InvoiceOrCreditNoteContext.Provider>
    );
};

/**Must be used inside a `CreditNoteContextProvider */
export const useCreditNoteContext = (): Omit<
    InvoiceOrCreditNoteContextType,
    "invoiceOrCreditNote"
> & {creditNote: CreditNote} => {
    const {
        invoiceOrCreditNote,
        isSubmitting,
        fromSharing,
        readOnly,
        isMergeByErrorModalOpen,
        updateGroupBy,
        clearError,
    } = React.useContext(InvoiceOrCreditNoteContext);
    const creditNote = validateCreditNoteOrRaise(invoiceOrCreditNote);
    return {
        creditNote,
        isSubmitting,
        fromSharing,
        readOnly,
        isMergeByErrorModalOpen,
        updateGroupBy,
        clearError,
    };
};

/**Must be used inside a `InvoiceContextProvider */
export const useInvoiceContext = (): Omit<
    InvoiceOrCreditNoteContextType,
    "invoiceOrCreditNote"
> & {invoice: Invoice} => {
    const {
        invoiceOrCreditNote,
        isSubmitting,
        fromSharing,
        readOnly,
        isMergeByErrorModalOpen,
        updateGroupBy,
        clearError,
    } = React.useContext(InvoiceOrCreditNoteContext);
    const invoice = invoiceOrCreditNote as Invoice;
    return {
        invoice,
        isSubmitting,
        fromSharing,
        readOnly,
        isMergeByErrorModalOpen,
        updateGroupBy,
        clearError,
    };
};
