import {t} from "@dashdoc/web-core";
import {Box, Callout, Flex, Icon, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {Usage, formatDate} from "dashdoc-utils";
import React from "react";

import {RequestPlanUpgradeAction} from "./RequestPlanUpgradeAction";
import {usageService} from "./usage.service";

export type UsageCalloutProps = {
    usage: Usage;
};

export const UsageCallout = ({usage}: UsageCalloutProps) => {
    if (usage.limit === null) {
        // unlimited
        return null;
    }
    const {limit, used, period_end_date} = usage;
    let variant: "informative" | "warning" = usageService.limitWillBeReached(usage)
        ? "warning"
        : "informative";

    // Integrity protection if used>limit
    const usedToDisplay = Math.min(used, limit);
    return (
        <Callout iconDisabled variant={variant} mb={5}>
            <Flex alignItems="center">
                <Box flexGrow={1}>
                    <Flex alignItems="center">
                        <Text>
                            {t("usage.subcontract.remaining", {
                                smart_count: usedToDisplay,
                                limit,
                            })}
                        </Text>
                        {period_end_date && (
                            <TooltipWrapper
                                content={t("usage.subcontract.resetDate", {
                                    day: formatDate(period_end_date, "PPP"),
                                })}
                                boxProps={{display: "flex"}}
                            >
                                <Icon ml={2} name="info" />
                            </TooltipWrapper>
                        )}
                    </Flex>
                    <Text variant="captionBold" mt={3}>
                        {t("usage.subcontract.explanation", {smart_count: limit})}
                    </Text>
                </Box>

                <RequestPlanUpgradeAction />
            </Flex>
        </Callout>
    );
};
