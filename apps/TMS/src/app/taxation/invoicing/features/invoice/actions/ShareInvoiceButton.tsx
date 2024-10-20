import {t} from "@dashdoc/web-core";
import {IconButton} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FC} from "react";

import {ShareInvoiceOrCreditNoteModal} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/share/ShareInvoiceOrCreditNoteModal";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

export const ShareInvoiceButton: FC<{invoice: Invoice}> = ({invoice}) => {
    const [showShareInvoiceModal, openShareInvoiceModal, closeShareInvoiceModal] =
        useToggle(false);
    return (
        <>
            <IconButton
                ml={2}
                onClick={openShareInvoiceModal}
                name="share"
                label={t("common.share")}
                color="blue.default"
                data-testid="share-invoice-button"
            />
            {showShareInvoiceModal && (
                <ShareInvoiceOrCreditNoteModal
                    type="invoice"
                    status={invoice.status}
                    isDashdoc={invoice.is_dashdoc}
                    itemUid={invoice.uid}
                    debtorCompanyId={invoice.debtor.pk}
                    onClose={closeShareInvoiceModal}
                    attachments={invoice.attachments}
                />
            )}
        </>
    );
};
