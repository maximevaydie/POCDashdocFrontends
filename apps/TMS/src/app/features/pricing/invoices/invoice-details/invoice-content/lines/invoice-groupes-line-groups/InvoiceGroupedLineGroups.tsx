import {t} from "@dashdoc/web-core";
import {Box, Callout, Flex, Text} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import React, {FC, useContext} from "react";

import {ExpandAllAction} from "app/features/pricing/invoices/invoice-details/invoice-content/actions/ExpandAllAction";
import {ExpandContextProvider} from "app/features/pricing/invoices/invoice-details/invoice-content/contexts/ExpandContext";
import {InvoiceLineGroup} from "app/features/pricing/invoices/invoice-details/invoice-content/lines/invoice-line-groups/InvoiceLineGroup";

import {InvoiceOrCreditNoteContext} from "../../contexts/InvoiceOrCreditNoteContext";

import type {InvoiceLineGroup as InvoiceLineGroupData} from "app/taxation/invoicing/types/invoice.types";

export type Props = {
    onRemoveTransportFromInvoice?: (transportUid: string) => void;
    onEditInvoiceLineGroupDescription?: (invoiceLineGroupUid: InvoiceLineGroupData["id"]) => void;
};

export const InvoiceGroupedLineGroups: FC<Props> = (props) => {
    const {onRemoveTransportFromInvoice, onEditInvoiceLineGroupDescription} = props;
    const {invoiceOrCreditNote, readOnly} = useContext(InvoiceOrCreditNoteContext);

    if (!invoiceOrCreditNote) {
        return null;
    }

    const mergedLineGroups = invoiceOrCreditNote?.transports_groups_in_invoice ?? [];
    const notGroupedTransports = invoiceOrCreditNote?.transports_groups_in_invoice.filter(
        (mergedLineGroup) =>
            mergedLineGroup.merge_by === null || mergedLineGroup.merge_by === "NONE"
    );
    const NotFullyGrouped =
        notGroupedTransports &&
        notGroupedTransports.length > 0 &&
        notGroupedTransports[0].line_groups.length > 0;

    return (
        <Flex flexDirection="column">
            {NotFullyGrouped && (
                <Callout variant="warning" mb="4" mx="4" data-testid="merged-line-groups-callout">
                    {t("invoice.xTransportsNotGrouped", {
                        smart_count: notGroupedTransports[0].line_groups.length,
                    })}
                </Callout>
            )}
            {mergedLineGroups.map((mergedLineGroup, index) => {
                const color =
                    mergedLineGroup.merge_by === null || mergedLineGroup.merge_by === "NONE"
                        ? "yellow"
                        : "blue";
                const validLineGroups =
                    mergedLineGroup.line_groups.filter((lineGroup) => !!lineGroup.transport) ?? [];

                if (validLineGroups.length === 0) {
                    return null;
                }

                const title = `${mergedLineGroup.description} - ${validLineGroups.length} ${t(
                    "common.transports",
                    {
                        smart_count: validLineGroups.length,
                    }
                )}`.trim();

                const currency = invoiceOrCreditNote?.currency || "EUR";

                const price = formatNumber(mergedLineGroup.total_price_without_tax, {
                    style: "currency",
                    currency: currency,
                    maximumFractionDigits: 2,
                });

                return (
                    <ExpandContextProvider groups={validLineGroups} key={mergedLineGroup.uid}>
                        <Flex
                            py={2}
                            px={0}
                            css={{columnGap: "4px"}}
                            alignItems="center"
                            backgroundColor={`${color}.ultralight`}
                            justifyContent={"space-between"}
                        >
                            <Flex alignItems="center">
                                <ExpandAllAction />
                                <Text
                                    variant="captionBold"
                                    color={`${color}.dark`}
                                    data-testid={`invoice-transport-group-${index}-header`}
                                >
                                    {title}
                                </Text>
                            </Flex>
                            <Text
                                variant="h1"
                                color={`${color}.dark`}
                                fontWeight="bold"
                                textAlign="right"
                                pr={4}
                                data-testid={`invoice-transport-group-${index}-price`}
                            >
                                {t("common.priceWithoutTaxes", {price})}
                            </Text>
                        </Flex>
                        <Box>
                            {validLineGroups.map((lineGroup, groupIndex) => {
                                return (
                                    <InvoiceLineGroup
                                        key={lineGroup.id}
                                        groupIndex={groupIndex}
                                        invoiceLineGroup={lineGroup}
                                        currency={currency}
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
                        </Box>
                    </ExpandContextProvider>
                );
            })}
        </Flex>
    );
};
