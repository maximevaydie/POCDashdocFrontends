import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {Button, toast} from "@dashdoc/web-ui";
import React, {FC} from "react";
import {useDispatch} from "react-redux";

import {fetchDeleteDraftCreditNote} from "app/redux/actions/creditNotes";

export const DeleteButton: FC<{
    creditNoteUid: string;
    onCreditNoteDeleted?: () => void;
    setIsLoading?: () => void;
    setIsNotLoading?: () => void;
    onClose: () => void;
}> = ({creditNoteUid, onCreditNoteDeleted, setIsLoading, setIsNotLoading, onClose}) => {
    const dispatch = useDispatch();

    const handleDeleteCreditNote = async () => {
        setIsLoading?.();
        try {
            await dispatch(fetchDeleteDraftCreditNote(creditNoteUid));
            onCreditNoteDeleted?.();
        } catch (error) {
            toast.error(t("common.error"));
            Logger.error(`Credit Note with uid "${creditNoteUid}" not found;`);
        }
        setIsNotLoading?.();
    };
    return (
        <Button
            data-testid="delete-credit-note-button"
            variant="plain"
            severity="danger"
            withConfirmation
            confirmationMessage={t("creditNoteDetails.deleteCreditNoteWarning")}
            onClick={handleDeleteCreditNote}
            width={"100%"}
            justifyContent={"flex-start"}
            modalProps={{
                title: t("creditNoteDetails.deleteCreditNote"),
                mainButton: {
                    children: t("common.delete"),
                },
                onClose,
            }}
        >
            {t("creditNoteDetails.deleteCreditNote")}
        </Button>
    );
};
