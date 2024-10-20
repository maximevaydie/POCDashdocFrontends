import {t} from "@dashdoc/web-core";
import {Card, SidePanel} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {SentEmailsList} from "app/taxation/invoicing/features/invoice-or-credit-note/emails/SentEmailsList";

import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";

type CreditNoteInfoProps = {
    creditNote: CreditNote;
};

export const CreditNoteInfo: FunctionComponent<CreditNoteInfoProps> = ({creditNote}) => {
    return (
        <SidePanel title={t("creditNoteInfo.title")} isSticky>
            <Card p={4} mt={4}>
                <SentEmailsList
                    type="creditNote"
                    communicationStatuses={creditNote.communication_statuses}
                />
            </Card>
        </SidePanel>
    );
};
