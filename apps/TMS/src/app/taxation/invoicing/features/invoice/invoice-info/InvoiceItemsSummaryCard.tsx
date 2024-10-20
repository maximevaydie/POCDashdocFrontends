import {t} from "@dashdoc/web-core";
import {Box, Card, Flex, ProgressBar, Text} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {Invoice} from "app/taxation/invoicing/types/invoice.types";

import {invoiceInfoService} from "./invoiceInfo.service";

type InvoiceItemsSummaryCardProps = {
    invoice: Invoice;
};

export const InvoiceItemsSummaryCard: FunctionComponent<InvoiceItemsSummaryCardProps> = ({
    invoice,
}) => {
    const invoiceSummaryItems = invoiceInfoService.getInvoiceItemsSummary(invoice);
    const totalFreeTax = parseFloat(invoice.total_price);

    return (
        <Card p={3} pb={0}>
            <Text variant="h1" mb={4} mt={1} color="grey.dark">
                {t("invoice.invoiceItemSummary.title")}
            </Text>
            {invoiceSummaryItems.length === 0 && (
                <Text textAlign="center" color="grey.dark" mb={4}>
                    {t("invoicing.noInvoiceItem")}
                </Text>
            )}
            {invoiceSummaryItems.map(({uid, label, amount}) => (
                <Box key={uid} mb={4}>
                    <Flex mb={-4} width="100%" justifyContent="space-between">
                        <Text variant="h2" maxWidth="200px" ellipsis ml={2}>
                            {label}
                        </Text>
                        <Text color="grey.dark">
                            {t("common.priceWithoutTaxes", {
                                price: formatNumber(amount, {
                                    style: "currency",
                                    currency: invoice.currency,
                                    maximumFractionDigits: 2,
                                }),
                            })}
                        </Text>
                    </Flex>
                    <ProgressBar
                        progress={Math.floor((amount / totalFreeTax) * 100)}
                        progressColor="blue.default"
                    />
                </Box>
            ))}
        </Card>
    );
};
