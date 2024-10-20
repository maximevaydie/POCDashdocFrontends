import {getCompanySetting, useSelector} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Card, SidePanel} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {InvoiceItemsSummaryCard} from "app/taxation/invoicing/features/invoice/invoice-info/InvoiceItemsSummaryCard";
import {TrackingInvoicePaymentSummaryCard} from "app/taxation/invoicing/features/invoice/invoice-info/TrackingInvoicePaymentSummaryCard";
import {TrackingInvoicePaymentUpdateModal} from "app/taxation/invoicing/features/invoice/invoice-info/TrackingInvoicePaymentUpdateModal";
import {SentEmailsList} from "app/taxation/invoicing/features/invoice-or-credit-note/emails/SentEmailsList";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

type InvoiceInfoProps = {
    invoice: Invoice;
};

export const InvoiceInfo: FunctionComponent<InvoiceInfoProps> = ({invoice}) => {
    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();
    const invoicePaymentSetting = useSelector((state) =>
        getCompanySetting(state, "invoice_payment")
    );

    const [
        showTrackInvoicePaymentUpdateModal,
        openTrackInvoicePaymentUpdateModal,
        closeTrackInvoicePaymentUpdateModal,
    ] = useToggle();

    return (
        <SidePanel title={t("invoiceInfo.title")} isSticky>
            <InvoiceItemsSummaryCard invoice={invoice} />
            {hasDashdocInvoicingEnabled && invoicePaymentSetting && (
                <TrackingInvoicePaymentSummaryCard
                    invoice={invoice}
                    onClickUpdate={openTrackInvoicePaymentUpdateModal}
                />
            )}
            <Card p={4} mt={4}>
                <SentEmailsList
                    type="invoice"
                    communicationStatuses={invoice.communication_statuses}
                />
            </Card>
            {showTrackInvoicePaymentUpdateModal && (
                <TrackingInvoicePaymentUpdateModal
                    invoice={invoice}
                    onClose={closeTrackInvoicePaymentUpdateModal}
                />
            )}
        </SidePanel>
    );
};
