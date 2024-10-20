import {urlService} from "@dashdoc/web-common";
import {t, translateMetricUnit} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    Card,
    Checkbox,
    EditableField,
    Flex,
    Icon,
    Link,
    Table,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {
    DeliveryDocumentType,
    TransportMessage,
    MessageDocumentType,
    formatNumber,
} from "dashdoc-utils";
import isNil from "lodash.isnil";
import React, {useContext} from "react";

import {InvoiceOrCreditNoteContext} from "app/features/pricing/invoices/invoice-details/invoice-content/contexts/InvoiceOrCreditNoteContext";
import {PricingTotalPricesOverview} from "app/features/pricing/pricing-total-prices-overview";
import {useSelector} from "app/redux/hooks";

import {invoiceLineService} from "../invoiceLine.service";

import {DocumentLink} from "./DocumentLink";

import type {InvoiceLine, LineGroup} from "app/taxation/invoicing/types/invoiceOrCreditNote.types";

type InvoiceLineGroupDetailsProps = {
    invoiceLineGroup: LineGroup;
    currency: string;
    onEditInvoiceLineGroupDescription?: () => void;
    "data-testid"?: string;
};

export const InvoiceLineGroupDetails = ({
    invoiceLineGroup,
    onEditInvoiceLineGroupDescription,
    currency,
    ...props
}: InvoiceLineGroupDetailsProps) => {
    const {fromSharing, readOnly} = useContext(InvoiceOrCreditNoteContext);
    const transport = invoiceLineGroup.transport;
    const allPriceColumns = [
        {width: "2.5em", getLabel: () => t("common.invoiceItem"), name: "invoiceItem"},
        {width: "3.5em", getLabel: () => t("common.description"), name: "description"},
        {width: "1.5em", getLabel: () => t("common.quantity"), name: "quantity", alignLeft: true},
        {
            width: "2.5em",
            getLabel: () => t("pricingMetrics.unitPrice"),
            name: "unit_price",
            alignLeft: true,
        },
        {width: "2.2em", getLabel: () => t("settings.totalNoVAT"), name: "price", alignLeft: true},
        {width: "1em", getLabel: () => t("components.VAT"), name: "vat", alignLeft: true},
        {
            width: "1em",
            getLabel: () => (
                <TooltipWrapper
                    boxProps={{
                        pt: 1,
                        textAlign: "center",
                        display: "inline-block",
                        width: "100%",
                    }}
                    content={t("components.gasIndex")}
                    placement="top"
                >
                    <Icon name="gasIndex" />
                </TooltipWrapper>
            ),
            name: "gas_index",
            alignLeft: true,
        },
    ];
    const priceColumns = !fromSharing
        ? allPriceColumns
        : allPriceColumns.filter((column) => column.name !== "invoiceItem");

    const getRowCellContent = (invoiceLine: InvoiceLine, columnName: string) => {
        switch (columnName) {
            case "invoiceItem":
                return <Text variant="caption">{invoiceLine.invoice_item?.description}</Text>;
            case "description":
                return <Text variant="caption">{invoiceLine.description}</Text>;
            case "quantity":
                return (
                    <Text variant="caption" textAlign="end">
                        {formatNumber(invoiceLine.quantity, {
                            maximumFractionDigits: 3,
                        })}
                        {invoiceLine.metric && (
                            <Text as="span" ml={2}>
                                {translateMetricUnit(invoiceLine.metric)}
                            </Text>
                        )}
                    </Text>
                );
            case "unit_price":
                return (
                    <Text variant="caption" textAlign="end">
                        {formatNumber(invoiceLine.unit_price, {
                            style: "currency",
                            currency: currency,
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 3,
                        })}
                    </Text>
                );
            case "price":
                // eslint-disable-next-line no-case-declarations
                const totalPrice =
                    parseFloat(invoiceLine.quantity) * parseFloat(invoiceLine.unit_price ?? "");
                return (
                    <Text variant="caption" textAlign="end">
                        {formatNumber(totalPrice, {
                            style: "currency",
                            currency: currency,
                        })}
                    </Text>
                );
            case "vat": {
                const taxRate = parseFloat(invoiceLine?.tax_rate ?? "");
                const text = isNaN(taxRate)
                    ? "—"
                    : formatNumber(taxRate / 100, {
                          style: "percent",
                          maximumFractionDigits: 2,
                      });
                return (
                    <Text variant="caption" textAlign="end">
                        {text}
                    </Text>
                );
            }
            case "gas_index":
                return (
                    !isNil(invoiceLine.is_gas_indexed) && (
                        <Flex justifyContent="center" pl={3}>
                            <Checkbox checked={invoiceLine.is_gas_indexed} disabled />
                        </Flex>
                    )
                );
            default:
                return "";
        }
    };

    const realTimeMessages = useSelector(
        (state) =>
            ((state.entities.transportMessage && Object.values(state.entities.transportMessage)) ||
                []) as TransportMessage[]
    );
    const documentsDict = invoiceLineService.getTransportDocumentsDict(
        invoiceLineGroup.transport,
        realTimeMessages
    );

    const getColumnLabel = (column: {
        alignLeft?: boolean;
        getLabel: () => string | JSX.Element;
    }) => {
        return column.alignLeft ? (
            <Text textAlign="end" variant="captionBold" ellipsis width="100%">
                {column.getLabel()}
            </Text>
        ) : (
            column.getLabel()
        );
    };

    return (
        <Flex flexDirection="row" bg="grey.ultralight">
            <Box my="4" ml="3" border="3px solid" borderColor="grey.light" borderRadius="2" />
            <Flex flexDirection="column" py="2" width="100%">
                <Flex mx="4" my="2" justifyContent="space-between" css={{columnGap: "16px"}}>
                    <Card p="2" flex="3">
                        <Text variant="h2">{t("common.description")}</Text>
                        {onEditInvoiceLineGroupDescription ? (
                            <EditableField
                                label=""
                                placeholder={
                                    readOnly
                                        ? t("components.noDescription")
                                        : t("components.addDescription")
                                }
                                clickable={!readOnly}
                                value={invoiceLineGroup.description}
                                onClick={onEditInvoiceLineGroupDescription}
                                data-testid={`${props["data-testid"]}-description`}
                            />
                        ) : (
                            <Text data-testid={`${props["data-testid"]}-description`}>
                                {invoiceLineGroup.description}
                            </Text>
                        )}
                    </Card>
                    <Card p="2" flex="1">
                        <Text variant="h2">{t("transportColumns.documents")}</Text>
                        <Box py="2">
                            {Object.entries(documentsDict).map(([category, documents]) =>
                                documents.map((document) => (
                                    <Box key={document.url}>
                                        <DocumentLink
                                            document={document}
                                            category={
                                                category as
                                                    | MessageDocumentType
                                                    | DeliveryDocumentType
                                            }
                                        />
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Card>
                </Flex>
                <Flex mx="4" my="2" flexDirection="column">
                    <Card p={2}>
                        <Text variant="h2" mb="2">
                            {t("common.price")}
                        </Text>
                        <Table
                            columns={priceColumns}
                            getColumnLabel={getColumnLabel}
                            rows={invoiceLineGroup.lines}
                            getRowCellContent={getRowCellContent}
                            getRowTestId={() => "invoice-line"}
                        />
                        <Flex justifyContent="flex-end" mt="4">
                            <PricingTotalPricesOverview
                                currency={currency}
                                totalPriceWithoutVat={parseFloat(
                                    invoiceLineGroup.total_price_without_tax
                                )}
                            />
                        </Flex>
                    </Card>
                </Flex>
                {fromSharing && (
                    <Flex mx="4" my="2" flexDirection="column">
                        <Card p={2}>
                            <Text variant="h2" color="grey.dark" mb="2">
                                {t("components.goToTracking")}&nbsp;
                            </Text>
                            <Flex flexDirection="row" flexWrap="wrap">
                                {transport.deliveries.map((delivery, index) => {
                                    const originCity = delivery.origin?.city || "";
                                    const destinationCity = delivery.destination?.city || "";
                                    return (
                                        <Badge key={index} variant="blue" mx={1} my={1}>
                                            <Link
                                                key={index}
                                                href={`${urlService.getBaseUrl()}/tracking/shipments/${delivery.uid}/`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                data-testid="link-to-transport"
                                            >
                                                <Flex alignItems="center">
                                                    {originCity}
                                                    <Icon name="arrowRight" mx={1} fontSize={0} />
                                                    {destinationCity}
                                                </Flex>
                                            </Link>
                                        </Badge>
                                    );
                                })}
                            </Flex>
                        </Card>
                    </Flex>
                )}
            </Flex>
        </Flex>
    );
};
