import {SearchQuery} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex, IconButton} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {BulkShareCreditNotesModal} from "app/taxation/invoicing/features/credit-note/actions/BulkShareCreditNotesModal";

export type CreditNotesBulkActionsProps = {
    selectedCreditNotesCount?: number;
    selectedCreditNotesQuery: SearchQuery;
};

export function CreditNoteBulkActions({
    selectedCreditNotesCount,
    selectedCreditNotesQuery,
}: CreditNotesBulkActionsProps) {
    const [
        showBulkShareCreditNotesModal,
        openBulkShareCreditNotesModal,
        closeBulkShareCreditNotesModal,
    ] = useToggle();

    return (
        <>
            <Flex ml={2} flex={1} alignItems="center" fontWeight={400} fontSize={2}>
                <Flex flexWrap="wrap">
                    <IconButton
                        name="share"
                        mx={2}
                        onClick={openBulkShareCreditNotesModal}
                        label={t("common.share")}
                        data-testid="credit-notes-screen-bulk-share-button"
                        color="blue.default"
                    />
                </Flex>
            </Flex>

            {showBulkShareCreditNotesModal && (
                <BulkShareCreditNotesModal
                    selectedCreditNotesCount={selectedCreditNotesCount}
                    selectedCreditNotesQuery={selectedCreditNotesQuery}
                    onClose={closeBulkShareCreditNotesModal}
                />
            )}
        </>
    );
}
