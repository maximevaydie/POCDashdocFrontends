import React from "react";

import {ManagersUsageTooltipContent} from "../ManagersUsageTooltipContent";
import {TruckersUsageTooltipContent} from "../TruckersUsageTooltipContent";
import {UsageCard} from "../UsageCard";

export default {
    title: "app/features/subscription/UsageCard",
    component: UsageCard,
};

export const underLimit = () => (
    <UsageCard
        title="Total active users"
        used={20}
        softLimit={25}
        tooltipContent={
            <ManagersUsageTooltipContent
                managers={20}
                managersSoftLimit={25}
                periodStartDate={"2023-01-01"}
                periodEndDate={"2023-02-01"}
            />
        }
    />
);

export const overLimit = () => (
    <UsageCard
        title="Total active truckers"
        used={25}
        softLimit={20}
        tooltipContent={
            <TruckersUsageTooltipContent
                truckers={25}
                truckersSoftLimit={20}
                periodStartDate={"2023-01-01"}
                periodEndDate={"2023-02-01"}
            />
        }
    />
);

export const noLimit = () => <UsageCard title="SMS sent" used={253} />;

export const zeroUsers = () => <UsageCard title="Total active truckers" used={0} softLimit={20} />;
