import {t} from "@dashdoc/web-core";
import {Button, HorizontalLine, theme} from "@dashdoc/web-ui";
import React, {FC} from "react";
import {useDispatch} from "react-redux";
import {useHistory} from "react-router";

import {fetchAddCreditNoteToInvoice} from "app/redux/actions/creditNotes";

export const CreateCreditNoteActionButton: FC<{
    invoiceUid: string;
    onCreateCreditNote?: (uid: string) => void;
}> = ({invoiceUid, onCreateCreditNote}) => {
    const dispatch = useDispatch();
    const history = useHistory();

    const createCreditNote = () => {
        fetchAddCreditNoteToInvoice(invoiceUid)(dispatch).then((res) =>
            onCreateCreditNote
                ? onCreateCreditNote(res["uid"])
                : history.push(`/app/credit-notes/${res["uid"]}`)
        );
    };
    return (
        <>
            <Button
                data-testid="create-credit-note-button"
                onClick={createCreditNote}
                variant="plain"
                color={`${theme.colors.grey.ultradark} !important`}
                width={"100%"}
                justifyContent={"flex-start"}
            >
                {t("invoiceDetails.createCreditNote")}
            </Button>
            <HorizontalLine borderColor="grey.light" my={0} />
        </>
    );
};
