import {t} from "@dashdoc/web-core";
import {Box, Flex, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import React from "react";

type PricingTotalPricesOverviewProps = {
    totalPriceWithoutVat: number;
    totalVat?: number | null;
    // if totalVat == undefined then VAT section is not displayed
    // if totalVat == null then VAT is displayed with an empty value -- (VAT is not set yet)
    // if totalVAT == number then VAT value is displayed
    currency: string;
};
export function PricingTotalPricesOverview({
    totalPriceWithoutVat,
    totalVat,
    currency,
}: PricingTotalPricesOverviewProps) {
    const totalPriceWithVat =
        totalVat !== null && totalVat !== undefined ? totalPriceWithoutVat + totalVat : null;

    if (totalVat === undefined) {
        return (
            <Flex
                p={2}
                justifyContent="space-between"
                border="1px solid"
                borderRadius={1}
                borderColor="grey.light"
                width={300}
                backgroundColor="grey.light"
            >
                <Text variant="h1" fontWeight={600}>
                    {t("settings.totalNoVAT")}
                </Text>
                <Text variant="h1" fontWeight={600} data-testid="total-price-without-vat">
                    {formatNumber(totalPriceWithoutVat, {style: "currency", currency: currency})}
                </Text>
            </Flex>
        );
    }

    return (
        <Box border="1px solid" borderRadius={1} borderColor="grey.light" width={300}>
            <Flex p={2} justifyContent="space-between">
                <Text>{t("settings.totalNoVAT")}</Text>
                <Text data-testid="total-price-without-vat">
                    {formatNumber(totalPriceWithoutVat, {style: "currency", currency: currency})}
                </Text>
            </Flex>

            <Flex p={2} justifyContent="space-between">
                <Text>{t("common.totalVAT")}</Text>

                <TooltipWrapper
                    content={totalVat === null ? t("pricing.fillEachInvoiceItem") : null}
                >
                    <Text data-testid="total-vat-amount">
                        {formatNumber(totalVat, {style: "currency", currency: currency})}
                    </Text>
                </TooltipWrapper>
            </Flex>
            <Flex p={2} backgroundColor="grey.light" justifyContent="space-between">
                <Text variant="h1" fontWeight={600}>
                    {t("common.totalTTC")}
                </Text>
                <Text data-testid="total-price-with-vat" variant="h1" fontWeight={600}>
                    {formatNumber(totalPriceWithVat, {style: "currency", currency: currency})}
                </Text>
            </Flex>
        </Box>
    );
}
