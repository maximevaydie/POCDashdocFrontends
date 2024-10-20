import {t} from "@dashdoc/web-core";
import {Flex, Text} from "@dashdoc/web-ui";
import {formatDate, formatNumber} from "dashdoc-utils";
import React from "react";

type Props = {
    isOldEmissionRate: boolean;
    value: number | null;
    periodStart: Date;
    periodEnd: Date;
};

export function EmissionRateBox({isOldEmissionRate, value, periodStart, periodEnd}: Props) {
    const text = isOldEmissionRate
        ? t("carbonFootprint.emissionRateOld")
        : t("carbonFootprint.emissionRateNew");

    return (
        <Flex
            flexDirection="column"
            backgroundColor={isOldEmissionRate ? "grey.ultralight" : "blue.ultralight"}
            p={3}
            borderRadius={1}
        >
            <Text variant="caption">{text}</Text>
            <Text variant="h2">
                {formatNumber(value, {
                    minimumFractionDigits: 2,
                })}{" "}
                {t("carbonFootprint.emissionRate.unit")}
            </Text>
            <Text>
                {t("carbonFootprint.emissionRatePeriod", {
                    start: formatDate(periodStart, "P"),
                    end: formatDate(periodEnd, "P"),
                })}
            </Text>
        </Flex>
    );
}
