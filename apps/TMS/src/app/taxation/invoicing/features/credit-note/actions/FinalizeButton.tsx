import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";
import {useDispatch} from "react-redux";

import {fetchFinalizeCreditNote} from "app/redux/actions/creditNotes";
import {FinalizeModal} from "app/taxation/invoicing/features/credit-note/actions/FinalizeModal";

import type {InvoiceLink} from "app/taxation/invoicing/types/creditNote.types";

export function FinalizeButton({
    invoicingDate,
    dueDate,
    creditNoteUid,
    generatedFromInvoice,
}: {
    invoicingDate: string | null;
    dueDate: string | null;
    creditNoteUid: string;
    generatedFromInvoice: InvoiceLink | null;
}) {
    const dispatch = useDispatch();

    const [isOpenConfirmFinalizeModal, openConfirmFinalizeModal, closeConfirmFinalizeModal] =
        useToggle(false);

    const handleConfirmMarkFinal = (invoicingDate: string, dueDate: string) => {
        dispatch(
            fetchFinalizeCreditNote(creditNoteUid, {
                invoicing_date: invoicingDate,
                due_date: dueDate,
            })
        );
        closeConfirmFinalizeModal();
    };
    return (
        <>
            <Button
                data-testid="finalize-credit-note-button"
                variant="primary"
                onClick={openConfirmFinalizeModal}
                ml={2}
            >
                {t("common.finalize")}
            </Button>
            {isOpenConfirmFinalizeModal && (
                <FinalizeModal
                    invoicingDate={invoicingDate}
                    dueDate={dueDate}
                    generatedFromInvoice={generatedFromInvoice}
                    onClose={closeConfirmFinalizeModal}
                    onSubmit={handleConfirmMarkFinal}
                />
            )}
        </>
    );
}
