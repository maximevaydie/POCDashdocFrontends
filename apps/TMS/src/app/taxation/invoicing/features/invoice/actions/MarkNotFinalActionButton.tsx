import {AnalyticsEvent, analyticsService, getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, theme} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FC} from "react";
import {useDispatch, useSelector} from "react-redux";

import MarkInvoiceNotFinalModal from "app/features/pricing/invoices/actions/mark-invoice-not-final-modal";
import {fetchMarkInvoiceNotFinal} from "app/redux/actions/invoices";

export const MarkNotFinalActionButton: FC<{
    invoiceUid: string;
}> = ({invoiceUid}) => {
    const connectedCompany = useSelector(getConnectedCompany);
    const dispatch = useDispatch();

    const [
        isOpenConfirmMarkNotFinalModal,
        openConfirmMarkNotFinalModal,
        closeConfirmMarkNotFinalModal,
    ] = useToggle(false);

    const handleConfirmMarkNotFinal = () => {
        analyticsService.sendEvent(AnalyticsEvent.invoiceRollbacked, {
            "company id": connectedCompany?.pk,
            "invoice uid": invoiceUid,
        });

        dispatch(fetchMarkInvoiceNotFinal(invoiceUid));
        closeConfirmMarkNotFinalModal();
    };
    return (
        <>
            <Button
                key="mark-invoice-not-final-button"
                data-testid="mark-invoice-not-final-button"
                variant="plain"
                color={`${theme.colors.grey.ultradark} !important`}
                onClick={openConfirmMarkNotFinalModal}
                width={"100%"}
                justifyContent={"flex-start"}
            >
                {t("invoice.markNotFinal")}
            </Button>
            {isOpenConfirmMarkNotFinalModal && (
                <MarkInvoiceNotFinalModal
                    onClose={closeConfirmMarkNotFinalModal}
                    onSubmit={handleConfirmMarkNotFinal}
                />
            )}
        </>
    );
};
