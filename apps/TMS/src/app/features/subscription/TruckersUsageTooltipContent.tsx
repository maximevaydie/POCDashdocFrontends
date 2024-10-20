import {t} from "@dashdoc/web-core";
import {Badge, Box, Flex, Icon, Text} from "@dashdoc/web-ui";
import {HorizontalLine} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import React from "react";

type Props = {
    truckers: number | null;
    truckersSoftLimit: number | null;
    periodStartDate: string | null;
    periodEndDate: string | null;
};

export function TruckersUsageTooltipContent({
    truckers,
    truckersSoftLimit,
    periodStartDate,
    periodEndDate,
}: Props) {
    if (truckers === null) {
        return null;
    }

    return (
        <Box px={2} py={4}>
            <Text variant="h1">{t("subscription.truckersUsageTooltip.activeTruckerTitle")}</Text>

            <HorizontalLine />
            <Text backgroundColor="grey.light" p={2} variant="caption">
                {t("subscription.truckersUsageTooltip.activeTruckerDescription")}
            </Text>
            <HorizontalLine />

            {periodStartDate !== null && periodEndDate !== null && (
                <Text variant="h2">
                    {t("subscription.currentPeriod", {
                        periodStartDate: formatDate(periodStartDate, "PPP"),
                        periodEndDate: formatDate(periodEndDate, "PPP"),
                    })}
                </Text>
            )}

            {truckersSoftLimit !== null && (
                <>
                    <Box my={4}>
                        <Badge variant="blue">
                            <Text>
                                {t("subscription.countIncluded", {
                                    included: Math.min(truckers, truckersSoftLimit),
                                    soft_limit: truckersSoftLimit,
                                })}
                            </Text>
                        </Badge>
                        <Text variant="caption">
                            {t("subscription.truckersUsageTooltip.truckersSoftLimit", {
                                smart_count: truckersSoftLimit,
                            })}
                        </Text>
                    </Box>

                    {truckers > truckersSoftLimit && (
                        <Box my={4}>
                            <Badge variant="warning">
                                <Text>
                                    {t("subscription.countOverage", {
                                        smart_count: truckers - truckersSoftLimit,
                                    })}
                                </Text>
                            </Badge>
                            <Text variant="caption">
                                {t("subscription.truckersUsageTooltip.truckersOverage", {
                                    smart_count: truckers - truckersSoftLimit,
                                })}
                            </Text>
                        </Box>
                    )}

                    <Flex mt={2} mb={2}>
                        <Icon name="info" mr={2} color="grey.dark" />
                        <Text variant="caption" color="grey.dark">
                            {t("subscription.additionalCosts")}
                        </Text>
                    </Flex>
                </>
            )}
        </Box>
    );
}
