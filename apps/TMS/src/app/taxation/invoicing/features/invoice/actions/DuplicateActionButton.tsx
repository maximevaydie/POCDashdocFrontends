import {useDispatch} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Button, HorizontalLine, theme, toast} from "@dashdoc/web-ui";
import React from "react";
import {useHistory} from "react-router";

import {fetchDuplicateInvoice} from "app/redux/actions";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

type Props = {
    invoiceUid: string;
    onDuplicate?: (duplicatedInvoiceUid: string) => void;
    onClose?: () => void;
};

export function DuplicateActionButton({invoiceUid, onClose, onDuplicate}: Props) {
    const history = useHistory();
    const dispatch = useDispatch();

    const duplicateInvoice = async () => {
        try {
            const {uid}: Invoice = await fetchDuplicateInvoice(invoiceUid)(dispatch);
            toast.success(t("invoice.sucessfullyDuplicated"), {
                toastId: "duplicate-invoice-success-toast",
            });
            if (onDuplicate) {
                onDuplicate(uid);
            } else {
                history.push(`/app/invoices/${uid}`);
            }
            onClose?.();
        } catch (error) {
            Logger.error("Error duplicating invoice", error);
            toast.error("invoice.failedToDuplicate", {toastId: "duplicate-invoice-error-toast"});
        }
    };

    return (
        <>
            <Button
                data-testid="duplicate-invoice-button"
                onClick={() => duplicateInvoice()}
                variant="plain"
                color={`${theme.colors.grey.ultradark} !important`}
                width={"100%"}
                justifyContent={"flex-start"}
            >
                {t("components.duplicate")}
            </Button>
            <HorizontalLine borderColor="grey.light" my={0} />
        </>
    );
}
