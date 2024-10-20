import {guid} from "@dashdoc/core";
import {getConnectedCompany, useTimezone} from "@dashdoc/web-common";
import {usePaginatedFetch} from "@dashdoc/web-common/src/hooks/usePaginatedFetch";
import {
    Flex,
    FloatingPanelWithSidePanel,
    FullHeightMinWidthScreen,
    SidePanelProvider,
} from "@dashdoc/web-ui";
import {parseQueryString} from "dashdoc-utils";
import React, {useState} from "react";
import {useLocation} from "react-router";

import {getTransportsQueryParamsFromFiltersQuery} from "app/features/filters/deprecated/utils";
import {InvoiceTransportsFlow} from "app/features/pricing/invoices/invoice-transports-flow/InvoiceTransportsFlow";
import {
    CancelInvoicesReloadContext,
    useInvoiceEventHandler,
} from "app/features/pricing/invoices/useInvoiceEventHandler";
import {useSelector} from "app/redux/hooks";
import {useRefreshInvoices} from "app/taxation/invoicing/hooks/useRefreshInvoices";
import {CreditNoteScreen} from "app/taxation/invoicing/screens/CreditNoteScreen";
import {InvoiceScreen} from "app/taxation/invoicing/screens/InvoiceScreen";
import {CreditNote} from "app/taxation/invoicing/types/creditNote.types";
import {TransportsToInvoiceQuery} from "app/types/transport";

import {InvoicesList} from "../../features/pricing/invoices/InvoicesList";

import type {PartialInvoice} from "app/taxation/invoicing/types/invoice.types";
import type {Transport} from "app/types/transport";

export const InvoicesScreen = () => {
    const connectedCompany = useSelector(getConnectedCompany);
    const timezone = useTimezone();
    const [previewedInvoice, setPreviewInvoice] = useState<PartialInvoice["uid"] | null>(null);
    const [previewedCreditNote, setPreviewCreditNote] = useState<CreditNote["uid"] | null>(null);
    const [reloadInvoicesKey, setReloadInvoicesKey] = useState<string>("initial");
    const refreshInvoices = useRefreshInvoices();

    const {cancelInvoicesReload} = useInvoiceEventHandler(
        refreshInvoices,
        !previewedCreditNote && !previewedInvoice
    );
    const location = useLocation();
    const creditNoteDocumentNumber =
        (parseQueryString(location.search)?.filterByCreditNote as string) || null;

    const initialQuery: TransportsToInvoiceQuery = {
        carrier__in: connectedCompany ? [connectedCompany.pk.toString()] : [],
        address__in: [],
        debtor__in: [],
        shipper__in: [],
        origin_address__in: [],
        destination_address__in: [],
        tags__in: [],
        text: [],
        verified: true,
        archived: false,
        ordering: "debtor,-created",
    };

    const [currentQuery, setCurrentQuery] = useState(
        creditNoteDocumentNumber
            ? {...initialQuery, credit_note_document_number: creditNoteDocumentNumber}
            : initialQuery
    );

    const {
        items: transports,
        isLoading: isLoadingTransports,
        loadNext: onPoolOfTransportsEndReached,
        totalCount: transportsCount,
        reload: reloadTransportsToInvoice,
    } = usePaginatedFetch<Transport>(
        "/transports/",
        getTransportsQueryParamsFromFiltersQuery(currentQuery, timezone, true)
    );
    const updateTransportsQuery = (newQuery: Partial<TransportsToInvoiceQuery>) => {
        setCurrentQuery((previousQuery) => ({...previousQuery, ...newQuery}));
    };

    const resetTransportsQuery = () => {
        setCurrentQuery(initialQuery);
    };
    const handleDeleteInvoice = () => {
        setPreviewInvoice(null);
        reloadTransportsToInvoice?.();
        refreshInvoices();
        cancelInvoicesReload();
    };
    const handleEditCreditNote = (uid: string) => {
        setPreviewInvoice(null);
        setPreviewCreditNote(uid);
    };
    const handleEditInvoice = (uid: string) => {
        setPreviewCreditNote(null);
        setPreviewInvoice(uid);
    };

    const handleReInvoiceTransports = (creditNoteNumber: string) => {
        setPreviewCreditNote(null);
        setCurrentQuery({...initialQuery, credit_note_document_number: creditNoteNumber});
    };

    const handleDuplicateInvoice = (duplicatedInvoiceUid: string) => {
        refreshInvoices();
        setPreviewInvoice(duplicatedInvoiceUid);
    };

    return (
        <FullHeightMinWidthScreen>
            <CancelInvoicesReloadContext.Provider value={{cancelInvoicesReload}}>
                <Flex height="100%" flex={1} flexDirection="row">
                    <Flex flex={2}>
                        <InvoicesList
                            setPreviewInvoice={setPreviewInvoice}
                            key={reloadInvoicesKey}
                        />
                    </Flex>
                    <Flex
                        flex={1}
                        borderLeftWidth="1px"
                        borderLeftStyle="solid"
                        borderLeftColor="grey.light"
                        backgroundColor="grey.white"
                        zIndex="navbar"
                    >
                        <InvoiceTransportsFlow
                            key={
                                "credit_note_document_number" in currentQuery &&
                                currentQuery.credit_note_document_number
                                    ? `invoice-transport-flow-${currentQuery.credit_note_document_number}`
                                    : "invoice-transport-flow"
                            }
                            currentTransportsQuery={currentQuery}
                            transports={transports}
                            isLoadingTransports={isLoadingTransports}
                            onPoolOfTransportsEndReached={onPoolOfTransportsEndReached}
                            totalTransportsCount={transportsCount}
                            updateTransportsQuery={updateTransportsQuery}
                            resetTransportsQuery={resetTransportsQuery}
                            reloadTransportsFetch={reloadTransportsToInvoice}
                            reloadInvoices={() => setReloadInvoicesKey(guid())}
                            setPreviewInvoice={setPreviewInvoice}
                        />
                    </Flex>
                </Flex>
                {previewedInvoice && (
                    <SidePanelProvider width="350px">
                        <FloatingPanelWithSidePanel
                            width="60%"
                            minWidth="600px"
                            onClose={setPreviewInvoice.bind(undefined, null)}
                        >
                            <InvoiceScreen
                                invoiceUid={previewedInvoice}
                                onDeleteInvoice={handleDeleteInvoice}
                                fromFloatingPanel={true}
                                onEditCreditNote={handleEditCreditNote}
                                onDuplicateInvoice={handleDuplicateInvoice}
                            />
                        </FloatingPanelWithSidePanel>
                    </SidePanelProvider>
                )}
                {previewedCreditNote && (
                    <SidePanelProvider width="350px">
                        <FloatingPanelWithSidePanel
                            width="60%"
                            minWidth="600px"
                            onClose={setPreviewCreditNote.bind(undefined, null)}
                        >
                            <CreditNoteScreen
                                creditNoteUid={previewedCreditNote}
                                fromFloatingPanel={true}
                                onEditInvoice={handleEditInvoice}
                                onReInvoiceTransports={handleReInvoiceTransports}
                                displayBackToInvoice={true}
                            />
                        </FloatingPanelWithSidePanel>
                    </SidePanelProvider>
                )}
            </CancelInvoicesReloadContext.Provider>
        </FullHeightMinWidthScreen>
    );
};
