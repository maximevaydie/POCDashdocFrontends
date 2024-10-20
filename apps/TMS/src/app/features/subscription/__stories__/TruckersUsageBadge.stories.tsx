import React from "react";

import {TruckersUsageBadge} from "../TruckersUsageBadge";

export default {
    title: "app/features/subscription/TruckersUsageBadge",
    component: TruckersUsageBadge,
};

export const underLimit = () => (
    <TruckersUsageBadge
        truckers={20}
        truckersSoftLimit={25}
        periodStartDate="2023-04-10"
        periodEndDate="2023-05-10"
    />
);

export const overLimit = () => (
    <TruckersUsageBadge
        truckers={30}
        truckersSoftLimit={25}
        periodStartDate="2023-04-10"
        periodEndDate="2023-05-10"
    />
);

export const withZeroTruckers = () => (
    <TruckersUsageBadge
        truckers={0}
        truckersSoftLimit={10}
        periodStartDate="2023-04-10"
        periodEndDate="2023-05-10"
    />
);

export const withZeroTruckersLimit = () => (
    <TruckersUsageBadge
        truckers={0}
        truckersSoftLimit={0}
        periodStartDate="2023-04-10"
        periodEndDate="2023-05-10"
    />
);

export const withNoLimit = () => (
    <TruckersUsageBadge
        truckers={9}
        truckersSoftLimit={null}
        periodStartDate={null}
        periodEndDate={null}
    />
);
