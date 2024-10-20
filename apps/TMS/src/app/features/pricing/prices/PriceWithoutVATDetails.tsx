import {t, translateMetricUnit} from "@dashdoc/web-core";
import {Badge, Flex, Text} from "@dashdoc/web-ui";
import {PricingMetricKey, formatNumber, formatNumberWithCustomUnit} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

type MetricForPriceWithoutVATDetails = PricingMetricKey | "PERCENT";

export type LineForPriceWithoutVATDetails = {
    description: string;
    metric: MetricForPriceWithoutVATDetails;
    quantity: string;
    unit_price: string;
    price: string;
};

interface PriceWithoutVADetailsProps {
    lines: LineForPriceWithoutVATDetails[];
    emptyMessage?: string;
    currency?: string;
    totalPrice?: string;
    dataTestId?: string;
}

const formatQuantity = (quantity: string, metric: MetricForPriceWithoutVATDetails) => {
    if (metric === "PERCENT") {
        return formatNumber(quantity, {style: "percent", maximumFractionDigits: 2});
    }

    const unit = translateMetricUnit(metric);
    if (unit) {
        return formatNumberWithCustomUnit(quantity, {unit});
    }

    return formatNumber(quantity);
};

const formatUnitPrice = (
    unitPrice: string,
    metric: MetricForPriceWithoutVATDetails,
    currency: string
) => {
    let metricUnit = "";
    if (metric !== "PERCENT") {
        metricUnit = translateMetricUnit(metric) ?? "";
    }
    return formatNumberWithCustomUnit(
        unitPrice,
        {unit: metricUnit, currency: currency},
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        }
    );
};

/**
 *
 * @param lines: the lines to display
 * @param currency: the currency to display (by default: "EUR")
 * @param emptyMessage: the message to display when there is no line
 * @param totalPrice: the total price to display (by default: the sum of the lines)
 * @returns a component to display the price without VAT details
 */
export const PriceWithoutVATDetails: FunctionComponent<PriceWithoutVADetailsProps> = ({
    lines,
    currency = "EUR",
    emptyMessage = t("components.noPrice"),
    totalPrice,
    dataTestId,
}) => {
    const multiplySymbol = "*";
    const equalSymbol = "=";

    let totalPriceWihtoutVAT = totalPrice;
    if (totalPriceWihtoutVAT === undefined && lines.length) {
        totalPriceWihtoutVAT = lines
            .reduce((acc, line) => {
                acc += parseFloat(line.price);
                return acc;
            }, 0)
            .toString();
    }

    return (
        <Flex flexDirection="column">
            {!lines.length && (
                <Text color="grey.dark" mb={5}>
                    {emptyMessage}
                </Text>
            )}
            <Flex flex={3} flexDirection="column" alignItems="" mr={5}>
                {lines.map((line, index) => (
                    <Flex
                        key={index}
                        flexDirection="row"
                        justifyContent="space-between"
                        pt={index === 0 ? 0 : 2}
                        pb={3}
                        borderBottomStyle="solid"
                        borderBottomWidth={index === lines.length - 1 ? 0 : "1px"}
                        borderBottomColor="grey.light"
                        style={{gap: "12px"}}
                    >
                        <Flex alignItems="center">
                            <Text variant="caption">{line.description}</Text>
                        </Flex>
                        <Flex alignItems="center" flexShrink={0}>
                            <Flex data-testid={`${dataTestId}-line-${index}-quantity`}>
                                {formatQuantity(line.quantity, line.metric)}
                            </Flex>
                            <Text variant="h2" mx={3}>
                                {multiplySymbol}
                            </Text>
                            <Badge
                                variant="neutral"
                                data-testid={`${dataTestId}-line-${index}-unit-price`}
                            >
                                {formatUnitPrice(line.unit_price, line.metric, currency)}
                            </Badge>
                            <Text variant="h2" mx={3}>
                                {equalSymbol}
                            </Text>
                            <Text
                                variant="h2"
                                data-testid={`${dataTestId}-line-${index}-price-without-vat`}
                            >
                                {formatNumber(line.price, {style: "currency", currency: currency})}
                            </Text>
                        </Flex>
                    </Flex>
                ))}
            </Flex>
            <Flex
                flex={1}
                backgroundColor="grey.light"
                flexDirection="row"
                p={1}
                justifyContent="flex-end"
                alignItems="center"
                borderRadius={1}
            >
                <Text variant="caption" textAlign="center" mr={6}>
                    {t("settings.totalNoVAT")}
                </Text>
                <Text
                    variant="title"
                    textAlign="center"
                    mr={3}
                    data-testid={`${dataTestId}-total-price-without-vat`}
                >
                    {formatNumber(totalPriceWihtoutVAT, {
                        style: "currency",
                        currency: currency,
                    })}
                </Text>
            </Flex>
        </Flex>
    );
};
