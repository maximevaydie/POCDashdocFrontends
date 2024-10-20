import {t} from "@dashdoc/web-core";
import {Badge, Box, Flex, Text, themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {formatNumber} from "dashdoc-utils";
import React from "react";

import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";

const HighlightedTextPrice = styled(Text)(
    themeAwareCss({
        fontSize: 4,
        fontWeight: 600,
        color: "red.dark",
    })
);

const TextPrice = styled(Text)(
    themeAwareCss({
        fontSize: 2,
        color: "grey.ultradark",
    })
);

type CreditNotePriceRecapProps = {
    creditNote: CreditNote;
};
export const CreditNotePriceRecap: React.FunctionComponent<CreditNotePriceRecapProps> = ({
    creditNote,
}) => {
    const priceWithoutVAT = formatNumber(creditNote.total_tax_free_amount, {
        style: "currency",
        currency: creditNote.currency,
        maximumFractionDigits: 2,
    });
    const priceWithVAT = creditNote.total_tax_amount
        ? formatNumber(
              parseFloat(creditNote.total_tax_free_amount) +
                  parseFloat(creditNote.total_tax_amount),
              {
                  style: "currency",
                  currency: creditNote.currency,
                  maximumFractionDigits: 2,
              }
          )
        : null;
    const AmountVAT = formatNumber(creditNote.total_tax_amount, {
        style: "currency",
        currency: creditNote.currency,
        maximumFractionDigits: 2,
    });

    return (
        <Badge shape="squared" minWidth={"150px"} px={3} py={2} variant="error">
            <Flex flexDirection={"column"} width={"100%"}>
                <Flex mb={3}>
                    <HighlightedTextPrice>{t("common.HT")}</HighlightedTextPrice>
                    <Box flex={1}></Box>
                    <HighlightedTextPrice
                        ml={4}
                        data-testid="credit-note-total-price-without-taxes"
                    >
                        {priceWithoutVAT}
                    </HighlightedTextPrice>
                </Flex>
                <Flex mb={1}>
                    <TextPrice>{t("common.VAT")}</TextPrice>
                    <Box flex={1}></Box>
                    <TextPrice ml={4} data-testid="credit-note-total-taxes-amount">
                        {AmountVAT}
                    </TextPrice>
                </Flex>
                <Flex>
                    <TextPrice>{t("common.TTC")}</TextPrice>
                    <Box flex={1}></Box>
                    <TextPrice ml={4} data-testid="credit-note-total-price-with-taxes">
                        {priceWithVAT}
                    </TextPrice>
                </Flex>
            </Flex>
        </Badge>
    );
};
