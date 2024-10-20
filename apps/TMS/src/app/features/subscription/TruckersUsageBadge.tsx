import {t} from "@dashdoc/web-core";
import {Flex, Badge, Text, Icon, TooltipWrapper} from "@dashdoc/web-ui";
import React from "react";

import {TruckersUsageTooltipContent} from "./TruckersUsageTooltipContent";

type Props = {
    truckers: number | null;
    truckersSoftLimit: number | null;
    periodStartDate: string | null;
    periodEndDate: string | null;
};

export function TruckersUsageBadge({
    truckers,
    truckersSoftLimit,
    periodStartDate,
    periodEndDate,
}: Props) {
    if (truckers === null) {
        return null;
    }

    return (
        <Badge
            variant={
                truckersSoftLimit !== null && truckers > truckersSoftLimit ? "warning" : "blue"
            }
        >
            <TooltipWrapper
                content={
                    <TruckersUsageTooltipContent
                        truckers={truckers}
                        truckersSoftLimit={truckersSoftLimit}
                        periodStartDate={periodStartDate}
                        periodEndDate={periodEndDate}
                    />
                }
            >
                <Flex>
                    <Text>{t("subscription.truckersUsageBadge", {smart_count: truckers})}</Text>
                    <Icon name={"info"} ml={2} />
                </Flex>
            </TooltipWrapper>
        </Badge>
    );
}
