import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {
    FreeTextModal,
    SubmitFreeTextPayload,
} from "app/taxation/invoicing/features/invoice-or-credit-note/free-text/FreeTextModal";

import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";
import type {Invoice} from "app/taxation/invoicing/types/invoice.types";

type AddFreeTextButton = {
    itemUid: string;
    fetchUpdate: (
        itemUid: string,
        payload: SubmitFreeTextPayload
    ) => (dispatch: Function) => Promise<Partial<Invoice> | Partial<CreditNote>>;
    readOnly: boolean;
    freeText?: string;
};

export function AddFreeTextButton({itemUid, fetchUpdate, readOnly, freeText}: AddFreeTextButton) {
    const [isFreeTextModalOpen, openFreeTextModal, closeFreeTextModal] = useToggle(false);

    if (readOnly) {
        return null;
    }
    return (
        <>
            <Button
                mr={5}
                variant="secondary"
                onClick={openFreeTextModal}
                data-testid="add-free-text-button"
            >
                {freeText ? t("invoicing.editFreeText") : t("invoicing.addFreeText")}
            </Button>
            {isFreeTextModalOpen && (
                <FreeTextModal
                    onClose={closeFreeTextModal}
                    itemUid={itemUid}
                    fetchUpdate={fetchUpdate}
                    initialValue={freeText}
                />
            )}
        </>
    );
}
