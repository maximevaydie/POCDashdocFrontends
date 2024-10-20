import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    Flex,
    IconButton,
    LastEmailStatus,
    OpenSidePanelContext,
    OpenSidePanelInfoButton,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate} from "dashdoc-utils";
import React, {useContext} from "react";

import {
    AVAILABLE_INVOICING_CONNECTORS,
    InvoicingDataSource,
} from "app/services/invoicing/connectors.service";
import {ShareCreditNoteButton} from "app/taxation/invoicing/features/credit-note/actions/ShareCreditNoteButton";
import {ShareInvoiceButton} from "app/taxation/invoicing/features/invoice/actions/ShareInvoiceButton";
import {
    getCreditNoteStatusLabel,
    getInvoiceStatusLabel,
    getStatusBadgeVariant,
} from "app/taxation/invoicing/services/invoiceOrCreditNoteStatus";

import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";
import type {Invoice} from "app/taxation/invoicing/types/invoice.types";

type AdditionalDetailHeaderProps = {
    fromSharing: boolean;
    title: React.ReactNode;
    additionalInfo?: React.ReactNode;
    fromFloatingPanel: boolean;
};

type InvoiceDetailHeaderProps =
    | ({
          type: "invoice";
          item: Invoice;
      } & AdditionalDetailHeaderProps)
    | ({
          type: "creditNote";
          item: CreditNote;
      } & AdditionalDetailHeaderProps);
export const InvoiceOrCreditNoteHeader: React.FunctionComponent<InvoiceDetailHeaderProps> = ({
    type,
    item,
    fromSharing,
    title,
    additionalInfo,
    fromFloatingPanel,
}) => {
    const timezone = useTimezone();
    const {open: openSidePanel} = useContext(OpenSidePanelContext);
    let invoicingConnectorLabel = "";
    if (type === "invoice") {
        const invoicingConnector = (item as Invoice).invoicing_connector;
        if (invoicingConnector) {
            let invoicingConnectorName = "";
            if (invoicingConnector.data_source === "custom_invoicing") {
                invoicingConnectorName = t("settings.invoicing.customIntegration");
            } else {
                invoicingConnectorName =
                    AVAILABLE_INVOICING_CONNECTORS[
                        invoicingConnector.data_source as InvoicingDataSource
                    ]?.name || "";
            }
            invoicingConnectorLabel = t("common.by_author", {
                author: invoicingConnectorName,
            });
        }
    }

    return (
        <Flex
            justifyContent="space-between"
            alignItems="baseline"
            flexWrap="wrap"
            width={"100%"}
            mb={1}
        >
            <Flex flexDirection={"row"} alignItems={"center"} width={"100%"}>
                <Box>
                    <Flex
                        alignItems="center"
                        minWidth="fit-content"
                        maxWidth="100%"
                        flexWrap="wrap"
                    >
                        {title}
                        <Box ml={2}>
                            <Badge
                                data-testid="invoice-detail-header-status"
                                mx={2}
                                variant={getStatusBadgeVariant(item.status)}
                            >
                                {type === "invoice"
                                    ? getInvoiceStatusLabel(item.status)
                                    : getCreditNoteStatusLabel(item.status)}
                            </Badge>
                        </Box>
                        {additionalInfo}
                    </Flex>

                    <Flex style={{columnGap: "8px"}} alignItems={"center"}>
                        <Text variant="caption" color="grey.dark">
                            {t(
                                type === "invoice"
                                    ? "common.invoiceCreatedOnDate"
                                    : "common.creditNoteCreatedOnDate",
                                {
                                    date: formatDate(
                                        parseAndZoneDate(item.created, timezone),
                                        "P"
                                    ),
                                }
                            )}{" "}
                            {invoicingConnectorLabel}
                        </Text>
                        {!fromSharing && (
                            <Flex alignItems="center">
                                {item.communication_statuses?.length > 0 && (
                                    <Flex style={{columnGap: "8px"}} alignItems={"center"}>
                                        <Text variant="caption">-</Text>
                                        <LastEmailStatus
                                            communicationStatuses={item.communication_statuses}
                                            onClick={openSidePanel}
                                            timezone={timezone}
                                        />
                                    </Flex>
                                )}
                            </Flex>
                        )}
                    </Flex>
                </Box>
                <Box flex={1} />
                {!fromSharing && (
                    <>
                        {type === "invoice" && (
                            <>
                                <ShareInvoiceButton key="share-invoice-button" invoice={item} />
                                <OpenSidePanelInfoButton />
                            </>
                        )}
                        {type === "creditNote" && item.status !== "draft" && (
                            <>
                                <ShareCreditNoteButton
                                    key="share-credit-note-button"
                                    creditNote={item}
                                />
                                <OpenSidePanelInfoButton />
                            </>
                        )}
                    </>
                )}
                {!fromSharing && fromFloatingPanel && (
                    <TooltipWrapper content={t("common.openInNewTab")}>
                        <IconButton
                            name="openInNewTab"
                            onClick={() =>
                                window.open(
                                    `/app/${type === "invoice" ? "invoices" : "credit-notes"}/${item.uid}`,
                                    "_blank"
                                )
                            }
                        />
                    </TooltipWrapper>
                )}
            </Flex>
        </Flex>
    );
};
