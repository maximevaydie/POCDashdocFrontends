import {t} from "@dashdoc/web-core";
import {Link} from "@dashdoc/web-ui";
import {stringifyQueryObject} from "dashdoc-utils";
import React from "react";
import {useHistory} from "react-router";

type LinkToReInvoiceTransportsProps = {
    creditNoteDocumentNumber: string;
    onReInvoiceTransports?: (creditNoteDocumentNumber: string) => void;
};
export const LinkToReInvoiceTransports: React.FunctionComponent<
    LinkToReInvoiceTransportsProps
> = ({creditNoteDocumentNumber, onReInvoiceTransports}) => {
    const history = useHistory();
    return (
        <Link
            data-testid="link-to-re-invoice-transports"
            onClick={() =>
                onReInvoiceTransports
                    ? onReInvoiceTransports(creditNoteDocumentNumber)
                    : history.push({
                          pathname: `/app/invoices`,
                          search: stringifyQueryObject({
                              filterByCreditNote: creditNoteDocumentNumber,
                          }),
                      })
            }
        >
            {t("creditNote.reinvoiceTransports.link")}
        </Link>
    );
};
