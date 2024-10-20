import React from "react";

import {ManagersUsageBadge} from "../ManagersUsageBadge";

export default {
    title: "app/features/subscription/ManagersUsageBadge",
    component: ManagersUsageBadge,
};

export const underLimit = () => (
    <ManagersUsageBadge
        managers={20}
        managersSoftLimit={25}
        periodStartDate="2023-04-10"
        periodEndDate="2023-05-10"
    />
);

export const overLimit = () => (
    <ManagersUsageBadge
        managers={30}
        managersSoftLimit={25}
        periodStartDate="2023-04-10"
        periodEndDate="2023-05-10"
    />
);

export const withZeroManagers = () => (
    <ManagersUsageBadge
        managers={0}
        managersSoftLimit={10}
        periodStartDate="2023-04-10"
        periodEndDate="2023-05-10"
    />
);

export const withZeroManagersLimit = () => (
    <ManagersUsageBadge
        managers={0}
        managersSoftLimit={0}
        periodStartDate="2023-04-10"
        periodEndDate="2023-05-10"
    />
);

export const withNoLimit = () => (
    <ManagersUsageBadge
        managers={9}
        managersSoftLimit={null}
        periodStartDate={null}
        periodEndDate={null}
    />
);
