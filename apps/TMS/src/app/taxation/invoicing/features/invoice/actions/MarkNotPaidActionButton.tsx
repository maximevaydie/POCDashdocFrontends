import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import React, {FC} from "react";
import {useDispatch} from "react-redux";

import {fetchMarkInvoiceNotPaid} from "app/redux/actions/invoices";

export const MarkNotPaidActionButton: FC<{
    invoiceUid: string;
}> = ({invoiceUid}) => {
    const dispatch = useDispatch();

    const handleMarkNotPaid = () => {
        dispatch(fetchMarkInvoiceNotPaid(invoiceUid));
    };
    return (
        <Button
            data-testid="mark-invoice-not-paid-button"
            ml={2}
            variant="secondary"
            onClick={handleMarkNotPaid}
        >
            {t("invoiceDetails.markNotPaid")}
        </Button>
    );
};
