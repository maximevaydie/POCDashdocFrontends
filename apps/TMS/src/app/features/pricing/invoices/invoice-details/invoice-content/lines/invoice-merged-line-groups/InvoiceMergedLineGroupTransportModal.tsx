import {t} from "@dashdoc/web-core";
import {Badge, Flex, Modal, Text} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import React from "react";

import {ExpandAllAction} from "app/features/pricing/invoices/invoice-details/invoice-content/actions/ExpandAllAction";
import {ExpandContextProvider} from "app/features/pricing/invoices/invoice-details/invoice-content/contexts/ExpandContext";
import {LineContextProvider} from "app/features/pricing/invoices/invoice-details/invoice-content/contexts/LineContext";
import {InvoiceLineGroup} from "app/features/pricing/invoices/invoice-details/invoice-content/lines/invoice-line-groups/InvoiceLineGroup";

import type {LineGroup} from "app/taxation/invoicing/types/invoiceOrCreditNote.types";

type InvoiceMergedLineGroupTransportModalProps = {
    lineGroups: LineGroup[];
    currency: string;
    title: string;
    totalPriceWithoutTax: string;
    onClose: () => void;
    onRemoveTransportFromInvoice?: (transportUid: string) => void;
};

export const InvoiceMergedLineGroupTransportModal = ({
    title,
    lineGroups,
    currency,
    totalPriceWithoutTax,
    onClose,
    onRemoveTransportFromInvoice,
}: InvoiceMergedLineGroupTransportModalProps) => {
    const content = lineGroups.map((lineGroup, lineGroupIndex) => {
        return (
            <LineContextProvider lineId={lineGroup.id} key={lineGroup.id}>
                <InvoiceLineGroup
                    onDelete={() => onRemoveTransportFromInvoice?.(lineGroup.transport.uid)}
                    invoiceLineGroup={lineGroup}
                    currency={currency}
                    groupIndex={lineGroupIndex}
                />
            </LineContextProvider>
        );
    });

    return (
        <Modal title={title} mainButton={null} onClose={onClose} size="xlarge">
            <ExpandContextProvider groups={lineGroups}>
                <Flex justifyContent="space-between" alignItems="center">
                    <Flex alignItems={"center"}>
                        <ExpandAllAction />
                        <Text variant="title" color="grey.dark">
                            {t("common.xTransports", {smart_count: lineGroups.length})}
                        </Text>
                    </Flex>

                    <Badge
                        shape="squared"
                        p="3"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Text color="blue.default" variant="h1">
                            {formatNumber(totalPriceWithoutTax, {
                                style: "currency",
                                currency: currency,
                            })}
                        </Text>
                    </Badge>
                </Flex>
                <Flex flexDirection="column" mt={3}>
                    {content}
                </Flex>
            </ExpandContextProvider>
        </Modal>
    );
};
