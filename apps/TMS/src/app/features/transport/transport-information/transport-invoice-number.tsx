import {getConnectedCompany, useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {EditableField, LoadingWheel} from "@dashdoc/web-ui";
import React from "react";
import {useHistory} from "react-router";

import {useCompaniesInConnectedGroupView} from "app/hooks/useCompaniesInConnectedGroupView";
import {useSelector} from "app/redux/hooks";
import {invoicingRightService} from "app/services/invoicing";
import {transportViewerService} from "app/services/transport/transportViewer.service";

import type {Transport} from "app/types/transport";

type InvoiceInfoForTransport = {
    uid: string;
    document_number: string | null;
};

type TransportInvoiceNumberProps = {
    transport: Transport;
    isInvoiceLoading: boolean;
    invoice: InvoiceInfoForTransport | null;
    onClickOnInvoiceNumber: () => void;
    hideLabel?: boolean;
};

export const TransportInvoiceNumber = ({
    transport,
    isInvoiceLoading,
    invoice,
    onClickOnInvoiceNumber,
    hideLabel,
}: TransportInvoiceNumberProps) => {
    const history = useHistory();
    const connectedCompany = useSelector(getConnectedCompany);
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");
    const hasDashdocInvoicingEnabled = useFeatureFlag("dashdocInvoicing");
    const companyPksInConnectedGroup = useCompaniesInConnectedGroupView();

    const canSetInvoiceNumber = invoicingRightService.canSetInvoiceNumber(
        transport,
        connectedCompany?.pk,
        companyPksInConnectedGroup,
        hasDashdocInvoicingEnabled,
        hasInvoiceEntityEnabled
    );

    const isCarrier = transportViewerService.isCarrierOf(transport, connectedCompany?.pk);
    const isShipper = transportViewerService.isShipperOf(transport, connectedCompany?.pk);
    if (isCarrier && hasInvoiceEntityEnabled) {
        let invoiceNumberValue: React.ReactNode;
        if (isInvoiceLoading) {
            invoiceNumberValue = <LoadingWheel noMargin inline small />;
        } else if (invoice === null) {
            invoiceNumberValue = transport.invoice_number;
        } else if (invoice.document_number) {
            invoiceNumberValue = invoice.document_number;
        } else {
            invoiceNumberValue = t("invoice.status.draft");
        }
        return (
            <EditableField
                clickable={!!invoice}
                label={hideLabel ? "" : t("components.invoiceNumberLabel")}
                value={invoiceNumberValue}
                placeholder={t("components.addAnInvoiceNumber")}
                updateButtonLabel={invoice ? t("common.open") : undefined}
                onClick={
                    invoice
                        ? () => {
                              history.push(`/app/invoices/${invoice.uid}`);
                          }
                        : undefined
                }
                data-testid="invoice-number"
            />
        );
    }

    return (
        <EditableField
            clickable={canSetInvoiceNumber || (!!invoice && isShipper)}
            label={hideLabel ? "" : t("components.invoiceNumberLabel")}
            value={transport.invoice_number}
            placeholder={t("components.addAnInvoiceNumber")}
            onClick={
                invoice && invoice.document_number && isShipper
                    ? () => {
                          history.push(`/shared-invoices/${invoice.uid}/`);
                      }
                    : onClickOnInvoiceNumber
            }
            data-testid="invoice-number"
        ></EditableField>
    );
};
