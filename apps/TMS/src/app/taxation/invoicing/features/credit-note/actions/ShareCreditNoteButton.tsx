import {t} from "@dashdoc/web-core";
import {IconButton} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {ShareInvoiceOrCreditNoteModal} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/share/ShareInvoiceOrCreditNoteModal";

import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";

export function ShareCreditNoteButton({creditNote}: {creditNote: CreditNote}) {
    const [showShareModal, openShareModal, closeShareModal] = useToggle(false);
    return (
        <>
            <IconButton
                ml={2}
                onClick={openShareModal}
                name="share"
                label={t("common.share")}
                color="blue.default"
                data-testid="share-credit-note-button"
            />
            {showShareModal && (
                <ShareInvoiceOrCreditNoteModal
                    type="creditNote"
                    status={creditNote.status}
                    isDashdoc={true}
                    itemUid={creditNote.uid}
                    parentItemUid={creditNote.generated_from?.uid ?? null}
                    debtorCompanyId={creditNote.customer.pk}
                    onClose={closeShareModal}
                    attachments={[]}
                />
            )}
        </>
    );
}
