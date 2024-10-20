import {Flex, FloatingPanelWithSidePanel} from "@dashdoc/web-ui";
import {SidePanelProvider} from "@dashdoc/web-ui";
import {FullHeightMinWidthScreen} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {CreditNotesList} from "app/taxation/invoicing/features/credit-note/CreditNotesList";
import {
    CancelCreditNotesReloadContext,
    useCreditNoteEventHandler,
} from "app/taxation/invoicing/features/credit-note/hooks/useCreditNotesEventHandler";
import {useRefreshCreditNotes} from "app/taxation/invoicing/features/credit-note/hooks/useRefreshCreditNotes";
import {CreditNoteScreen} from "app/taxation/invoicing/screens/CreditNoteScreen";
import {InvoiceScreen} from "app/taxation/invoicing/screens/InvoiceScreen";

import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";
import type {PartialInvoice} from "app/taxation/invoicing/types/invoice.types";

export const CreditNotesListScreen = () => {
    const [previewedInvoice, setPreviewInvoice] = useState<PartialInvoice["uid"] | null>(null);
    const [previewedCreditNote, setPreviewCreditNote] = useState<CreditNote["uid"] | null>(null);

    const refreshCreditNotes = useRefreshCreditNotes();

    const {cancelCreditNoteReload} = useCreditNoteEventHandler(
        refreshCreditNotes,
        !previewedCreditNote && !previewedInvoice
    );

    const handleEditCreditNote = (uid: string) => {
        setPreviewInvoice(null);
        setPreviewCreditNote(uid);
    };
    const handleEditInvoice = (uid: string) => {
        setPreviewCreditNote(null);
        setPreviewInvoice(uid);
    };

    return (
        <FullHeightMinWidthScreen>
            <CancelCreditNotesReloadContext.Provider value={{cancelCreditNoteReload}}>
                <Flex height="100%" flex={1} flexDirection="row">
                    <Flex flex={2}>
                        <CreditNotesList setPreviewCreditNote={setPreviewCreditNote} />
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
                                onDeleteInvoice={() => setPreviewInvoice(null)}
                                fromFloatingPanel={true}
                                onEditCreditNote={handleEditCreditNote}
                            />
                        </FloatingPanelWithSidePanel>
                    </SidePanelProvider>
                )}
                {previewedCreditNote && (
                    <SidePanelProvider width="350px">
                        <FloatingPanelWithSidePanel
                            width="60%"
                            minWidth="600px"
                            onClose={() => setPreviewCreditNote(null)}
                        >
                            <CreditNoteScreen
                                creditNoteUid={previewedCreditNote}
                                fromFloatingPanel={true}
                                onEditInvoice={handleEditInvoice}
                                onReInvoiceTransports={undefined}
                                displayBackToInvoice={false}
                                afterDeleteCallback={() => {
                                    setPreviewCreditNote(null);
                                    refreshCreditNotes;
                                }}
                            />
                        </FloatingPanelWithSidePanel>
                    </SidePanelProvider>
                )}
            </CancelCreditNotesReloadContext.Provider>
        </FullHeightMinWidthScreen>
    );
};
