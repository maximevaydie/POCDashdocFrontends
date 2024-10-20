import {t} from "@dashdoc/web-core";
import {Flex, Text, WrapXLines} from "@dashdoc/web-ui";
import React from "react";

type Props = {
    showCarbonFootprint: boolean | null;
    totalCarbonFootprint: string | null;
    numTransportWithoutCarbonFootprint: string | null;
};

export function CarbonFootprintLine({
    showCarbonFootprint,
    totalCarbonFootprint,
    numTransportWithoutCarbonFootprint,
}: Props) {
    if (!showCarbonFootprint || !totalCarbonFootprint) {
        return null;
    }

    return (
        <Flex
            justifyContent="space-between"
            flex={1}
            alignItems="center"
            minHeight="50px"
            data-testid="free-text-line"
            borderBottomStyle="solid"
            borderBottomWidth="1px"
            borderBottomColor="grey.light"
        >
            <WrapXLines numberOfLines={4}>
                <Text
                    pl={5}
                    py={1}
                    textDecoration={showCarbonFootprint ? undefined : "line-through"}
                >
                    {numTransportWithoutCarbonFootprint
                        ? t("invoicePdf.totalEstimatedCarbonFootprintWithMissing", {
                              rounded_total_carbon_footprint: totalCarbonFootprint,
                              missing_count: numTransportWithoutCarbonFootprint,
                              smart_count: numTransportWithoutCarbonFootprint,
                          })
                        : t("invoicePdf.totalEstimatedCarbonFootprint", {
                              rounded_total_carbon_footprint: totalCarbonFootprint,
                          })}
                </Text>
            </WrapXLines>
        </Flex>
    );
}
