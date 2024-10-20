import {t} from "@dashdoc/web-core";
import {Box, Callout, Flex, Text} from "@dashdoc/web-ui";
import React, {useContext} from "react";

import {InvoiceOrCreditNoteContext} from "app/features/pricing/invoices/invoice-details/invoice-content/contexts/InvoiceOrCreditNoteContext";
import {invoiceLineService} from "app/features/pricing/invoices/invoice-details/invoice-content/lines/invoice-line-groups/invoiceLine.service";
import {InvoiceMergedLineGroup} from "app/features/pricing/invoices/invoice-details/invoice-content/lines/invoice-merged-line-groups/InvoiceMergedLineGroup";

import type {Invoice} from "app/taxation/invoicing/types/invoice.types";
import type {InvoiceMergedLineGroups as InvoiceMergedLineGroupsData} from "app/taxation/invoicing/types/invoiceOrCreditNote.types";

export type InvoiceMergedLineGroupsProps = {
    onRemoveTransportFromInvoice?: (transportUid: string) => void;
    displayThirdPartyCallout?: boolean;
};
export const InvoiceMergedLineGroups = ({
    onRemoveTransportFromInvoice,
    displayThirdPartyCallout = false,
}: InvoiceMergedLineGroupsProps) => {
    const {invoiceOrCreditNote} = useContext(InvoiceOrCreditNoteContext);

    const mergedLineGroups = invoiceOrCreditNote?.transports_groups_in_invoice ?? [];

    if (mergedLineGroups.length === 0) {
        return null;
    }

    const totalTransports = mergedLineGroups.reduce((total: number, mergedLineGroup) => {
        return total + mergedLineGroup.line_groups.length;
    }, 0);

    const isMergedByAllGroups = invoiceLineService.isMergedByAllGroups(
        invoiceOrCreditNote as Invoice
    );
    const isFullyMerged = invoiceLineService.isFullyMerged(invoiceOrCreditNote as Invoice);

    return (
        <Flex flexDirection="column">
            {!isFullyMerged && (
                <Callout variant="warning" mb="4" mx="4" data-testid="merged-line-groups-callout">
                    {t("invoice.xTransportsNotMerged", {
                        smart_count: invoiceOrCreditNote?.line_groups.length,
                    })}
                </Callout>
            )}
            {displayThirdPartyCallout && (
                <Callout variant="warning" mb="4" mx="4">
                    <Text>{t("components.invoice.productCodeLossExplanations")}</Text>
                </Callout>
            )}
            <Flex
                py={2}
                px={4}
                css={{columnGap: "4px"}}
                alignItems="center"
                backgroundColor="blue.ultralight"
            >
                <Text
                    variant="captionBold"
                    color="blue.dark"
                    data-testid="merged-line-groups-header"
                >
                    {isMergedByAllGroups
                        ? t("common.xTransports", {smart_count: totalTransports})
                        : t("invoice.xMergedLinesGroups", {smart_count: mergedLineGroups.length})}
                </Text>
            </Flex>
            <Box>
                {mergedLineGroups.map(
                    (mergedLineGroup: InvoiceMergedLineGroupsData, index: number) => {
                        return (
                            <InvoiceMergedLineGroup
                                index={index}
                                onRemoveTransportFromInvoice={onRemoveTransportFromInvoice}
                                mergedLineGroup={mergedLineGroup}
                                key={mergedLineGroup.uid}
                            />
                        );
                    }
                )}
            </Box>
        </Flex>
    );
};
