import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import React, {FC, useContext} from "react";

import {ExpandAllAction} from "app/features/pricing/invoices/invoice-details/invoice-content/actions/ExpandAllAction";
import {ExpandContextProvider} from "app/features/pricing/invoices/invoice-details/invoice-content/contexts/ExpandContext";

import {InvoiceOrCreditNoteContext} from "../../contexts/InvoiceOrCreditNoteContext";

import {invoiceLineService} from "./invoiceLine.service";
import {InvoiceLineGroup} from "./InvoiceLineGroup";

import type {
    Invoice,
    InvoiceLineGroup as InvoiceLineGroupData,
} from "app/taxation/invoicing/types/invoice.types";

export type InvoiceLineGroupsProps = {
    onRemoveTransportFromInvoice?: (transportUid: string) => void;
    onEditInvoiceLineGroupDescription?: (invoiceLineGroupUid: InvoiceLineGroupData["id"]) => void;
};

export const InvoiceOrCreditNoteLineGroups: FC<InvoiceLineGroupsProps> = (props) => {
    const {onRemoveTransportFromInvoice, onEditInvoiceLineGroupDescription} = props;
    const {invoiceOrCreditNote, readOnly} = useContext(InvoiceOrCreditNoteContext);
    const validLineGroups =
        invoiceOrCreditNote?.line_groups.filter((lineGroup) => !!lineGroup.transport) ?? [];

    if (validLineGroups.length === 0) {
        return null;
    }
    const invoiceIsMergedByAllGroups = invoiceLineService.isMergedByAllGroups(
        invoiceOrCreditNote as Invoice
    );
    const invoiceNotFullyMerged =
        invoiceOrCreditNote?.merge_by !== null &&
        invoiceOrCreditNote?.merge_by !== "NONE" &&
        !invoiceLineService.isFullyMerged(invoiceOrCreditNote as Invoice);

    const color = invoiceNotFullyMerged ? "yellow" : "blue";

    const subtitle = invoiceNotFullyMerged ? `${t("invoice.transportsNotMerged")} -` : "";
    const title = `${subtitle} ${validLineGroups.length} ${t("common.transports", {
        smart_count: validLineGroups.length,
    })}`.trim();

    return (
        <ExpandContextProvider groups={validLineGroups}>
            <Flex flexDirection="column">
                <Flex
                    py={2}
                    px={invoiceIsMergedByAllGroups ? 4 : 0}
                    css={{columnGap: "4px"}}
                    alignItems="center"
                    backgroundColor={`${color}.ultralight`}
                >
                    {!invoiceIsMergedByAllGroups && <ExpandAllAction />}
                    <Text variant="captionBold" color={`${color}.dark`}>
                        {title}
                    </Text>
                </Flex>
                <Box>
                    {!invoiceIsMergedByAllGroups && (
                        <>
                            {validLineGroups.map((lineGroup, groupIndex) => {
                                return (
                                    <InvoiceLineGroup
                                        key={lineGroup.id}
                                        groupIndex={groupIndex}
                                        invoiceLineGroup={lineGroup}
                                        currency={invoiceOrCreditNote?.currency || "EUR"}
                                        onDelete={() => {
                                            if (!readOnly) {
                                                onRemoveTransportFromInvoice?.(
                                                    lineGroup.transport.uid
                                                );
                                            }
                                        }}
                                        onEditInvoiceLineGroupDescription={() => {
                                            if (!readOnly) {
                                                onEditInvoiceLineGroupDescription?.(lineGroup.id);
                                            }
                                        }}
                                    />
                                );
                            })}
                        </>
                    )}
                </Box>
            </Flex>
        </ExpandContextProvider>
    );
};
