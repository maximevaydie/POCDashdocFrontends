import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import React from "react";
import {useDispatch} from "react-redux";

import {fetchMarkPaidCreditNote} from "app/redux/actions/creditNotes";

export function MarkPaidButton({creditNoteUid}: {creditNoteUid: string}) {
    const dispatch = useDispatch();

    const handleMarkPaid = () => {
        dispatch(fetchMarkPaidCreditNote(creditNoteUid));
    };
    return (
        <Button data-testid="mark-credit-note-paid-button" ml={2} onClick={handleMarkPaid}>
            {t("creditNote.markPaid")}
        </Button>
    );
}
