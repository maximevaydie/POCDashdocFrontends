import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text} from "@dashdoc/web-ui";
import {Pricing, formatNumber} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {
    LineForPriceWithoutVATDetails,
    PriceWithoutVATDetails,
} from "app/features/pricing/prices/PriceWithoutVATDetails";
import {getPricingCurrency} from "app/services/invoicing";
import {getFuelSurchargeApplicableTotalPrice} from "app/services/invoicing/pricingEntity.service";

export type TransportPriceDetailsProps = {
    pricing: Pricing | null;
    pricingMismatchAmount?: string | null;
};

const computePriceLines = (pricing: Pricing | null): LineForPriceWithoutVATDetails[] => {
    if (!pricing) {
        return [];
    }

    const lines: LineForPriceWithoutVATDetails[] = pricing.lines.map((line) => {
        return {
            description: line.description,
            metric: line.metric,
            quantity: line.final_quantity,
            unit_price: line.unit_price,
            price: line.final_price,
        };
    });

    if (
        pricing.final_gas_index &&
        pricing.final_price_with_gas_indexed !== pricing.final_price_without_gas_indexed
    ) {
        lines.push({
            description: t("components.gasIndex"),
            metric: "PERCENT",
            quantity: (parseFloat(pricing.final_gas_index) / 100).toString(),
            unit_price: getFuelSurchargeApplicableTotalPrice(pricing).toString(),
            price: (
                parseFloat(pricing.final_price_with_gas_indexed) -
                parseFloat(pricing.final_price_without_gas_indexed)
            ).toString(),
        });
    }

    if (pricing.tariff_grid_line) {
        lines.unshift({
            description: pricing.tariff_grid_line.description,
            metric:
                pricing.tariff_grid_line.pricing_policy === "flat"
                    ? "FLAT"
                    : pricing.tariff_grid_line.metric,
            quantity:
                pricing.tariff_grid_line.pricing_policy === "flat"
                    ? "1"
                    : pricing.tariff_grid_line.final_quantity,
            unit_price: pricing.tariff_grid_line.final_unit_price || "",
            price: pricing.tariff_grid_line.final_price || "",
        });
    }

    return lines;
};

export const TransportPriceDetails: FunctionComponent<TransportPriceDetailsProps> = ({
    pricing,
    pricingMismatchAmount,
}) => {
    const lines: LineForPriceWithoutVATDetails[] = computePriceLines(pricing);

    const currency = getPricingCurrency(pricing);
    return (
        <Flex flexDirection="column">
            <PriceWithoutVATDetails
                lines={lines}
                emptyMessage={t("transportPrice.noPriceEntered")}
                dataTestId="transport-price"
                currency={currency}
            />
            {pricingMismatchAmount && (
                <Flex
                    backgroundColor="red.ultralight"
                    mt={2}
                    p={2}
                    borderRadius={1}
                    style={{gap: "8px"}}
                    data-testid="transport-prices-mismatch-warning"
                >
                    <Icon color="red.dark" name="alert" />
                    <Text color="red.dark">{t("transportPrice.pricesMismatch")}</Text>
                    <Text
                        color="red.dark"
                        fontWeight="bold"
                        data-testid="transport-prices-mismatch-amount"
                    >
                        {formatNumber(pricingMismatchAmount, {
                            style: "currency",
                            currency,
                            signDisplay: "always",
                        })}
                    </Text>
                </Flex>
            )}
        </Flex>
    );
};
