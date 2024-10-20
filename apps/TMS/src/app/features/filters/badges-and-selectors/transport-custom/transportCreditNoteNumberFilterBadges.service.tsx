import {FilterData, FilteringBadge} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import React from "react";

type TransportCreditNoteNumberQuery = {
    credit_note_document_number?: string | null;
};
export function getTransportCreditNoteNumberFilterBadges(): FilterData<TransportCreditNoteNumberQuery> {
    return {
        key: "transports-credit-note-document-number",
        testId: "transports-credit-note-document-number",
        selector: null,
        getBadges: (query, updateQuery) => [
            {
                count:
                    query["credit_note_document_number"] !== null &&
                    query["credit_note_document_number"] !== undefined
                        ? 1
                        : 0,
                badge: (
                    <FilteringBadge
                        label={t("filters.creditNoteDocumentNumber", {
                            document_number: query["credit_note_document_number"],
                        })}
                        onDelete={() =>
                            updateQuery({
                                ["credit_note_document_number"]: null,
                            })
                        }
                        data-testid="transports-filters-badges-credit-note-document-number"
                    />
                ),
            },
        ],
    };
}
