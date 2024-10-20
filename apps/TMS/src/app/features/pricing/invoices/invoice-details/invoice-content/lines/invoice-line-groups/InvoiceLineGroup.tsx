import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Badge, Flex, Text} from "@dashdoc/web-ui";
import {TransportMessage, formatDate, parseAndZoneDate} from "dashdoc-utils";
import React, {FC} from "react";

import {useSelector} from "app/redux/hooks";

import {LineContextProvider} from "../../contexts/LineContext";
import {Line} from "../Line";

import {InvoiceLineGroupDetails} from "./components/InvoiceLineGroupDetail";
import {TransportLink} from "./components/TransportLink";
import {invoiceLineService} from "./invoiceLine.service";

import type {
    InvoiceTransport,
    LineGroup,
} from "app/taxation/invoicing/types/invoiceOrCreditNote.types";

type InvoiceLineGroupProps = {
    invoiceLineGroup: LineGroup;
    groupIndex: number;
    currency: string;
    onDelete: () => void;
    onEditInvoiceLineGroupDescription?: () => void;
};

export const InvoiceLineGroup = ({
    invoiceLineGroup,
    onDelete,
    groupIndex,
    currency,
    onEditInvoiceLineGroupDescription,
}: InvoiceLineGroupProps) => {
    const grossPrice = parseFloat(invoiceLineGroup.total_price_without_tax);

    return (
        <Flex
            flex={1}
            flexDirection="column"
            borderBottomStyle="solid"
            borderBottomWidth="1px"
            borderBottomColor="grey.light"
            data-testid={`invoice-line-group-${groupIndex}`}
        >
            <LineContextProvider lineId={invoiceLineGroup.id}>
                <Line
                    lineId={invoiceLineGroup.id}
                    data-testid={`invoice-line-group-${groupIndex}-line`}
                    content={
                        <Flex flex={1} justifyContent="space-between" alignItems="center">
                            <Content
                                invoiceLineGroup={invoiceLineGroup}
                                groupIndex={groupIndex}
                                onDeleteTransport={onDelete}
                                onEditInvoiceLineGroupDescription={
                                    onEditInvoiceLineGroupDescription
                                }
                            />
                        </Flex>
                    }
                    grossPrice={grossPrice}
                    currency={currency}
                >
                    <InvoiceLineGroupDetails
                        invoiceLineGroup={invoiceLineGroup}
                        currency={currency}
                        onEditInvoiceLineGroupDescription={onEditInvoiceLineGroupDescription}
                        data-testid={`invoice-line-group-${groupIndex}-details`}
                    />
                </Line>
            </LineContextProvider>
        </Flex>
    );
};

const Content: FC<{
    invoiceLineGroup: LineGroup;
    groupIndex: number;
    onDeleteTransport: () => void;
    onEditInvoiceLineGroupDescription?: () => void;
}> = ({invoiceLineGroup, groupIndex, onDeleteTransport, onEditInvoiceLineGroupDescription}) => {
    const transport = invoiceLineGroup.transport;
    const timezone = useTimezone();

    const realTimeMessages = useSelector(
        (state) =>
            ((state.entities.transportMessage && Object.values(state.entities.transportMessage)) ||
                []) as TransportMessage[]
    );
    const documentsDict = invoiceLineService.getTransportDocumentsDict(
        transport,
        realTimeMessages
    );
    const documentsCount = Object.keys(documentsDict).length;

    const label =
        t("transportDetails.transportNumber", {
            number: transport.sequential_id,
        }) +
        t("common.colon") +
        getTransportCities(transport).join(" - ");

    return (
        <Flex flex={1} justifyContent="space-between">
            <Flex alignItems="center" width="100%">
                <Text display="flex" color="grey.dark" mr={3} flexShrink={0}>
                    {formatDate(
                        parseAndZoneDate(invoiceLineGroup.ordering_datetime, timezone),
                        "P"
                    )}
                </Text>
                <Flex alignItems="center" flexWrap="wrap" style={{columnGap: "12px"}} width="100%">
                    <Text flex="1">{label}</Text>
                    <Flex px="4" ml="auto">
                        <TransportLink
                            onDeleteTransport={onDeleteTransport}
                            onEditInvoiceLineGroupDescription={onEditInvoiceLineGroupDescription}
                            deleteConfirmationMessage={t(
                                "invoiceContent.confirmRemoveTransportFromInvoice",
                                {
                                    transportNumber: transport.sequential_id,
                                }
                            )}
                            transport={transport}
                            data-testid={`group-${groupIndex}-transport-link`}
                        />
                    </Flex>
                </Flex>
            </Flex>
            {documentsCount > 0 && (
                <Flex flexShrink={0} alignItems="center" mr={1}>
                    <Badge paddingX={1} shape="squared" variant="neutral">
                        <Text variant="subcaption">
                            {t("components.documentCount", {smart_count: documentsCount})}
                        </Text>
                    </Badge>
                </Flex>
            )}
        </Flex>
    );
};

const getTransportCities = (transport: InvoiceTransport) => {
    let citiesBySiteUid: Record<string, string> = {};
    for (const delivery of transport.deliveries) {
        if (delivery.origin?.city) {
            citiesBySiteUid[delivery.origin.uid] = delivery.origin.city;
        }
        if (delivery.destination?.city) {
            citiesBySiteUid[delivery.destination.uid] = delivery.destination.city;
        }
    }
    return Object.values(citiesBySiteUid);
};
