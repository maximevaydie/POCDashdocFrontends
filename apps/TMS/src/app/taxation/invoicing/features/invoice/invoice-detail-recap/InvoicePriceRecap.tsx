import {t} from "@dashdoc/web-core";
import {Badge, Box, Flex, Text, themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {formatNumber} from "dashdoc-utils";
import React from "react";

import {Invoice} from "app/taxation/invoicing/types/invoice.types";

const HighlightedTextPrice = styled(Text)(
    themeAwareCss({
        fontSize: 4,
        fontWeight: 600,
        color: "blue.dark",
    })
);

const TextPrice = styled(Text)(
    themeAwareCss({
        fontSize: 2,
        color: "grey.ultradark",
    })
);

type InvoicePriceRecapProps = {
    invoice: Invoice;
};
export const InvoicePriceRecap: React.FunctionComponent<InvoicePriceRecapProps> = ({invoice}) => {
    const priceWithoutVAT = formatNumber(invoice.total_price, {
        style: "currency",
        currency: invoice.currency,
        maximumFractionDigits: 2,
    });
    const priceWithVAT = invoice.total_tax_amount
        ? formatNumber(parseFloat(invoice.total_price) + parseFloat(invoice.total_tax_amount), {
              style: "currency",
              currency: invoice.currency,
              maximumFractionDigits: 2,
          })
        : null;
    const AmountVAT = formatNumber(invoice.total_tax_amount, {
        style: "currency",
        currency: invoice.currency,
        maximumFractionDigits: 2,
    });

    return (
        <Badge shape="squared" px={3} py={2}>
            {invoice.total_tax_amount ? (
                <Flex flexDirection={"column"} width={"100%"}>
                    <Flex mb={3}>
                        <HighlightedTextPrice>{t("common.HT")}</HighlightedTextPrice>
                        <Box flex={1}></Box>
                        <HighlightedTextPrice
                            ml={4}
                            data-testid="invoice-total-price-without-taxes"
                        >
                            {priceWithoutVAT}
                        </HighlightedTextPrice>
                    </Flex>
                    <Flex mb={1}>
                        <TextPrice>{t("common.VAT")}</TextPrice>
                        <Box flex={1}></Box>
                        <TextPrice ml={4} data-testid="invoice-total-taxes-amount">
                            {AmountVAT}
                        </TextPrice>
                    </Flex>
                    <Flex>
                        <TextPrice>{t("common.TTC")}</TextPrice>
                        <Box flex={1}></Box>
                        <TextPrice ml={4} data-testid="invoice-total-price-with-taxes">
                            {priceWithVAT}
                        </TextPrice>
                    </Flex>
                </Flex>
            ) : (
                <Text
                    variant="title"
                    color="blue.dark"
                    fontWeight="bold"
                    data-testid="invoice-total-price-without-taxes"
                >
                    {t("common.priceWithoutTaxes", {
                        price: priceWithoutVAT,
                    })}
                </Text>
            )}
        </Badge>
    );
};
