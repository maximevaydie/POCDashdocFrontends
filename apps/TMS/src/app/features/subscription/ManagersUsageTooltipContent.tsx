import {t} from "@dashdoc/web-core";
import {Badge, Box, Flex, Icon, Text} from "@dashdoc/web-ui";
import {HorizontalLine} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import React from "react";

type Props = {
    managers: number | null;
    managersSoftLimit: number | null;
    periodStartDate: string | null;
    periodEndDate: string | null;
};

export function ManagersUsageTooltipContent({
    managers,
    managersSoftLimit,
    periodStartDate,
    periodEndDate,
}: Props) {
    if (managers === null) {
        return null;
    }

    return (
        <Box px={2} py={4}>
            <Text variant="h1">{t("subscription.managersUsageTooltip.activeManagerTitle")}</Text>

            <HorizontalLine />
            <Text backgroundColor="grey.light" p={2} variant="caption">
                {t("subscription.managersUsageTooltip.activeManagerDescription")}
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

            {managersSoftLimit !== null && (
                <>
                    <Box my={4}>
                        <Badge variant="blue">
                            <Text>
                                {t("subscription.countIncluded", {
                                    included: Math.min(managers, managersSoftLimit),
                                    soft_limit: managersSoftLimit,
                                })}
                            </Text>
                        </Badge>
                        <Text variant="caption">
                            {t("subscription.managersUsageTooltip.managersSoftLimit", {
                                smart_count: managersSoftLimit,
                            })}
                        </Text>
                    </Box>

                    {managers > managersSoftLimit && (
                        <Box my={4}>
                            <Badge variant="warning">
                                <Text>
                                    {t("subscription.countOverage", {
                                        smart_count: managers - managersSoftLimit,
                                    })}
                                </Text>
                            </Badge>
                            <Text variant="caption">
                                {t("subscription.managersUsageTooltip.managersOverage", {
                                    smart_count: managers - managersSoftLimit,
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
