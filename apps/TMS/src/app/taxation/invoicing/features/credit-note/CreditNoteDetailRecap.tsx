import {Card, Flex} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {fetchUpdateCreditNote} from "app/redux/actions/creditNotes";
import {CreditNotePriceRecap} from "app/taxation/invoicing/features/credit-note/CreditNotePriceRecap";
import {DetailRecapContent} from "app/taxation/invoicing/features/invoice-or-credit-note/detail-recap/DetailRecapContent";
import {EditableNotes} from "app/taxation/invoicing/features/invoice-or-credit-note/detail-recap/EditableNotes";
import {EditInvoicingAndDueDatesModal} from "app/taxation/invoicing/features/invoice-or-credit-note/detail-recap/EditInvoicingDateModal";
import {EditNotesModal} from "app/taxation/invoicing/features/invoice-or-credit-note/detail-recap/EditNotesModal";
import {CreditNote} from "app/taxation/invoicing/types/creditNote.types";

type CreditNoteDetailRecapProps = {
    creditNote: CreditNote;
    fromSharing: boolean;
};
export const CreditNoteDetailRecap: React.FunctionComponent<CreditNoteDetailRecapProps> = ({
    creditNote,
    fromSharing,
}) => {
    const [showEditDatesModal, openEditDatesModal, closeEditDatesModal] = useToggle(false);
    const [showEditNotesModal, openEditNotesModal, closeEditNotesModal] = useToggle(false);

    const isDraft = creditNote.status === "draft";
    const canUpdate = !fromSharing && isDraft;

    return (
        <Card p={5}>
            <Flex>
                <DetailRecapContent
                    customer={creditNote.customer}
                    carrier={creditNote.created_by}
                    dates={{
                        show: true,
                        value: {
                            invoicingDate: creditNote.invoicing_date,
                            dueDate: creditNote.due_date,
                        },
                        onUpdate: canUpdate ? openEditDatesModal : undefined,
                    }}
                    fromSharing={fromSharing}
                />
                <Flex flexDirection="column">
                    <Flex justifyContent="flex-end" alignItems="flex-end" mt={9}>
                        <CreditNotePriceRecap creditNote={creditNote} />
                    </Flex>
                </Flex>
            </Flex>
            <EditableNotes
                value={creditNote.notes}
                onUpdate={canUpdate ? openEditNotesModal : undefined}
            />
            {showEditDatesModal && creditNote.uid && (
                <EditInvoicingAndDueDatesModal
                    itemUid={creditNote.uid}
                    initialInvoicingDate={creditNote.invoicing_date}
                    initialDueDate={creditNote.due_date}
                    fetchUpdate={fetchUpdateCreditNote}
                    onClose={closeEditDatesModal}
                />
            )}
            {showEditNotesModal && creditNote.uid && (
                <EditNotesModal
                    itemUid={creditNote.uid}
                    initialNotes={creditNote.notes}
                    fetchUpdate={fetchUpdateCreditNote}
                    onClose={closeEditNotesModal}
                />
            )}
        </Card>
    );
};
