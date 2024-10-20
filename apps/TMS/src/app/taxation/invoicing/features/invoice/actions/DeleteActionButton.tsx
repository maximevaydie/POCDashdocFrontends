import {getConnectedCompany} from "@dashdoc/web-common";
import {AnalyticsEvent, analyticsService} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {Button, toast} from "@dashdoc/web-ui";
import React, {FC} from "react";
import {useDispatch, useSelector} from "react-redux";

import {fetchDeleteInvoice} from "app/redux/actions/invoices";

export const DeleteActionButton: FC<{
    invoiceUid: string;
    onInvoiceDeleted?: () => void;
    setIsLoading?: () => void;
    setIsNotLoading?: () => void;
    onClose?: () => void;
}> = ({invoiceUid, onInvoiceDeleted, setIsLoading, setIsNotLoading, onClose}) => {
    const connectedCompany = useSelector(getConnectedCompany);
    const dispatch = useDispatch();

    const handleDeleteInvoice = async () => {
        setIsLoading?.();
        try {
            analyticsService.sendEvent(AnalyticsEvent.invoiceDeleted, {
                "company id": connectedCompany?.pk,
                "invoice uid": invoiceUid,
            });

            await dispatch(fetchDeleteInvoice(invoiceUid));
            onInvoiceDeleted?.();
        } catch (error) {
            toast.error(t("common.error"));
            Logger.error(`Invoice with uid "${invoiceUid}" not found;`);
        }
        setIsNotLoading?.();
    };
    return (
        <Button
            data-testid="delete-invoice-button"
            variant="plain"
            severity="danger"
            withConfirmation
            confirmationMessage={t("invoiceDetails.deleteInvoiceWarning")}
            onClick={handleDeleteInvoice}
            width={"100%"}
            justifyContent={"flex-start"}
            modalProps={{
                title: t("invoiceDetails.deleteInvoice"),
                mainButton: {
                    children: t("common.delete"),
                },
                onClose: onClose,
            }}
        >
            {t("invoiceDetails.deleteInvoice")}
        </Button>
    );
};
