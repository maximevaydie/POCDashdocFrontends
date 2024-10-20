import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {SearchQuery} from "app/redux/reducers/searches";
import {InvoiceExportModal} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/InvoiceExportModal";
import {InvoiceExportOpenedFrom} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/types";

import type {InvoicesListQuery} from "app/features/filters/deprecated/utils";

type Props = {
    currentQuery: InvoicesListQuery;
    selectedInvoicesQuery: SearchQuery;
    selectedInvoicesCount: number;
    selectedCreditNotesCount: number;
    openedFrom: InvoiceExportOpenedFrom;
};

export function InvoiceExportAction({
    currentQuery,
    selectedInvoicesQuery,
    selectedInvoicesCount,
    selectedCreditNotesCount,
    openedFrom,
}: Props) {
    const [isModalOpen, openModal, closeModal] = useToggle();
    return (
        <>
            <Button variant="secondary" onClick={openModal} data-testid="invoice-export-button">
                {t("common.export")}
            </Button>
            {isModalOpen && (
                <InvoiceExportModal
                    onClose={closeModal}
                    currentQuery={currentQuery}
                    selectedInvoicesQuery={selectedInvoicesQuery}
                    selectedInvoicesCount={selectedInvoicesCount}
                    selectedCreditNotesCount={selectedCreditNotesCount}
                    openedFrom={openedFrom}
                />
            )}
        </>
    );
}
