import {t} from "@dashdoc/web-core";
import {Flex, Badge, Text, Icon, TooltipWrapper} from "@dashdoc/web-ui";
import React from "react";

import {ManagersUsageTooltipContent} from "./ManagersUsageTooltipContent";

type Props = {
    managers: number | null;
    managersSoftLimit: number | null;
    periodStartDate: string | null;
    periodEndDate: string | null;
};

export function ManagersUsageBadge({
    managers,
    managersSoftLimit,
    periodStartDate,
    periodEndDate,
}: Props) {
    if (managers === null) {
        return null;
    }

    return (
        <Badge
            variant={
                managersSoftLimit !== null && managers > managersSoftLimit ? "warning" : "blue"
            }
        >
            <TooltipWrapper
                content={
                    <ManagersUsageTooltipContent
                        managers={managers}
                        managersSoftLimit={managersSoftLimit}
                        periodStartDate={periodStartDate}
                        periodEndDate={periodEndDate}
                    />
                }
            >
                <Flex>
                    <Text>{t("subscription.managersUsageBadge", {smart_count: managers})}</Text>
                    <Icon name={"info"} ml={2} />
                </Flex>
            </TooltipWrapper>
        </Badge>
    );
}
