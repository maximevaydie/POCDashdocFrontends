import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import React from "react";
import {useDispatch} from "react-redux";

import {fetchMarkNotPaidCreditNote} from "app/redux/actions/creditNotes";

export function MarkNotPaidButton({creditNoteUid}: {creditNoteUid: string}) {
    const dispatch = useDispatch();

    const handleMarkNotPaid = () => {
        dispatch(fetchMarkNotPaidCreditNote(creditNoteUid));
    };
    return (
        <Button data-testid="mark-credit-note-not-paid-button" ml={2} onClick={handleMarkNotPaid}>
            {t("creditNote.markNotPaid")}
        </Button>
    );
}
