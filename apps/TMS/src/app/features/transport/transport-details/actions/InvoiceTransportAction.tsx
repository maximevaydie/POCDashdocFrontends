import {t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {createContext, ReactNode, useContext} from "react";
import {useDispatch} from "react-redux";

import {InvoiceInfoForTransport} from "app/features/pricing/transport-price/TransportPrice";
import InvoiceTransportModal from "app/features/transport/actions/bulk/invoice-transports-modal";
import {fetchRetrieveTransport} from "app/redux/actions";
import {CreatedInvoice} from "app/services/invoicing";
import {InvoicingOnboardingWizard} from "app/taxation/invoicing/features/onboarding-wizard/InvoicingOnboardingWizard";

export const InvoiceTransportContext = createContext({
    invoiceModalOpen: false,
    openInvoiceModal: () => {},
    closeInvoiceModal: () => {},
});

export function InvoiceTransportWrapper({children}: {children: ReactNode}) {
    const [invoiceModalOpen, openInvoiceModal, closeInvoiceModal] = useToggle(false);
    return (
        <InvoiceTransportContext.Provider
            value={{invoiceModalOpen, openInvoiceModal, closeInvoiceModal}}
        >
            {children}
        </InvoiceTransportContext.Provider>
    );
}

export function InvoiceTransportModals({
    transportUid,
    refetchTransports,
    setInvoice,
    reloadTransportsToInvoice,
}: {
    transportUid: string;
    refetchTransports?: (onlyCounters?: boolean) => void;
    setInvoice: (value: InvoiceInfoForTransport | null) => void;
    reloadTransportsToInvoice?: (invoicesCreated?: boolean) => void;
}) {
    const {invoiceModalOpen, closeInvoiceModal} = useContext(InvoiceTransportContext);
    const [
        invoicingOnboardingModalOpen,
        openInvoicingOnboardingModal,
        closeInvoicingOnboardingModal,
    ] = useToggle(false);
    const dispatch = useDispatch();
    return (
        <>
            {invoiceModalOpen && (
                <InvoiceTransportModal
                    selectedTransportsQuery={{uid__in: [transportUid]}}
                    selectedTransportsCount={1}
                    onClose={closeInvoiceModal}
                    onInvoicesCreated={(invoices: CreatedInvoice[]) => {
                        if (invoices.length === 1) {
                            setInvoice({
                                uid: invoices[0].uid,
                                document_number: invoices[0].document_number,
                            });
                            dispatch(fetchRetrieveTransport(transportUid));
                            refetchTransports?.();
                            reloadTransportsToInvoice?.(true);
                        }
                    }}
                    onDashdocInvoicingNotReady={openInvoicingOnboardingModal}
                />
            )}

            {invoicingOnboardingModalOpen && (
                <InvoicingOnboardingWizard onClose={closeInvoicingOnboardingModal} />
            )}
        </>
    );
}

export function InvoiceTransportButton({
    isLoading,
    isDeleted,
    isStatusButtonLoading,
    refetchTransports,
}: {
    isLoading: boolean;
    isDeleted: boolean;
    isStatusButtonLoading: boolean;
    refetchTransports?: (onlyCounters?: boolean) => void;
}) {
    const {openInvoiceModal} = useContext(InvoiceTransportContext);

    return (
        <>
            <Button
                ml={2}
                key="invoicedButton"
                data-testid="invoiced-button"
                onClick={(e) => {
                    e.preventDefault();
                    refetchTransports?.();
                    openInvoiceModal();
                }}
                loading={isStatusButtonLoading}
                disabled={isDeleted || isLoading}
            >
                <Icon name="accountingInvoice" mr={2} />
                {t("action.invoice")}
            </Button>
        </>
    );
}
