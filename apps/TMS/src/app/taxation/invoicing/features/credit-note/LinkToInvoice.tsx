import {t} from "@dashdoc/web-core";
import {Link} from "@dashdoc/web-ui";
import React from "react";
import {useHistory} from "react-router";

import type {InvoiceLink} from "app/taxation/invoicing/types/creditNote.types";

type CreditNoteLinkToInvoiceProps = {
    generatedFromInvoice: InvoiceLink;
    onEditInvoice?: (uid: string) => void;
    fromSharing?: boolean;
    openInNewTab?: boolean;
};
export const LinkToInvoice: React.FunctionComponent<CreditNoteLinkToInvoiceProps> = ({
    generatedFromInvoice,
    onEditInvoice,
    fromSharing = false,
    openInNewTab = false,
}) => {
    const history = useHistory();
    return (
        <Link data-testid="link-to-invoice" onClick={goToInvoice}>
            {generatedFromInvoice.document_number
                ? t("invoiceDetails.documentNumber", {
                      number: generatedFromInvoice.document_number,
                  })
                : t("components.invoice")}
        </Link>
    );

    function goToInvoice() {
        if (fromSharing) {
            history.push(`/shared-invoices/${generatedFromInvoice.uid}`);
        } else if (onEditInvoice && !openInNewTab) {
            onEditInvoice(generatedFromInvoice.uid);
        } else if (openInNewTab) {
            window.open(`/app/invoices/${generatedFromInvoice.uid}`, "_blank");
        } else {
            history.push(`/app/invoices/${generatedFromInvoice.uid}`);
        }
    }
};
