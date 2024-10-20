import {t} from "@dashdoc/web-core";
import {Box, Callout, Card, Flex, Text} from "@dashdoc/web-ui";
import React, {FC} from "react";

import {useCreditNoteContext} from "app/features/pricing/invoices/invoice-details/invoice-content/contexts/InvoiceOrCreditNoteContext";
import {InvoiceGroupedLineGroups} from "app/features/pricing/invoices/invoice-details/invoice-content/lines/invoice-groupes-line-groups/InvoiceGroupedLineGroups";
import {InvoiceOrCreditNoteLineGroups} from "app/features/pricing/invoices/invoice-details/invoice-content/lines/invoice-line-groups/InvoiceLineGroups";
import {InvoiceMergedLineGroups} from "app/features/pricing/invoices/invoice-details/invoice-content/lines/invoice-merged-line-groups/InvoiceMergedLineGroups";
import {fetchUpdateCreditNote} from "app/redux/actions/creditNotes";
import {AddCreditNoteStandaloneLineAction} from "app/taxation/invoicing/features/credit-note/actions/AddCreditNoteStandaloneLineAction";
import {StandaloneCreditNoteLines} from "app/taxation/invoicing/features/credit-note/StandaloneCreditNoteLines";
import {AddFreeTextButton} from "app/taxation/invoicing/features/invoice-or-credit-note/free-text/AddFreeTextButton";
import {FreeTextLine} from "app/taxation/invoicing/features/invoice-or-credit-note/free-text/FreeTextLine";

/**Assumes that's it's wrapped by a `CreditNoteContextProvider` */
export const CreditNoteContent: FC<{
    afterUpdateCallback?: () => unknown;
}> = ({afterUpdateCallback}) => {
    const {creditNote, fromSharing} = useCreditNoteContext();
    const isDraft = creditNote.status === "draft";
    const canUpdate = !fromSharing && isDraft;
    return (
        <>
            <Card flex="1 1 400px" mt={4} py={4}>
                {fromSharing && (
                    <Callout mx={5} mb={4}>
                        <Text ml={4}>{t("sharedCreditNote.warning")}</Text>
                    </Callout>
                )}

                <Box>
                    {creditNote.group_mode === "MERGED" && <InvoiceMergedLineGroups />}
                    {creditNote.group_mode == "GROUPED" && <InvoiceGroupedLineGroups />}
                    <InvoiceOrCreditNoteLineGroups />
                    <StandaloneCreditNoteLines hideIfEmpty={!creditNote.is_bare_credit_note} />
                    <FreeTextLine
                        itemUid={creditNote.uid}
                        freeText={creditNote.free_text}
                        fetchUpdate={fetchUpdateCreditNote}
                        readOnly={!canUpdate}
                    />
                </Box>
                {canUpdate && (
                    <Flex px={5} mt={5}>
                        {creditNote.is_bare_credit_note && (
                            <AddCreditNoteStandaloneLineAction
                                creditNote={creditNote}
                                successCallback={() => {
                                    afterUpdateCallback?.();
                                }}
                            />
                        )}
                        <AddFreeTextButton
                            itemUid={creditNote.uid}
                            fetchUpdate={fetchUpdateCreditNote}
                            freeText={creditNote.free_text}
                            readOnly={false}
                        />
                    </Flex>
                )}
            </Card>
        </>
    );
};
