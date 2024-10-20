import {Box} from "@dashdoc/web-ui";
import React from "react";

import {LegendItemStatus} from "./LegendItemStatus";
import {LegendSiteType} from "./LegendSiteType";

export const LegendCharteringContent = () => {
    return (
        <Box p={2}>
            <Box borderBottom="1px dashed" borderColor="grey.light" mb={1} pb={1}>
                <LegendItemStatus status="sent_to_charter" truckerStatus="unassigned" />
                <LegendItemStatus status="accepted_by_charter" truckerStatus="unassigned" />
                <LegendItemStatus status="declined" truckerStatus="unassigned" />
            </Box>
            <Box borderBottom="1px solid" borderColor="grey.light" pb={3}>
                <LegendItemStatus status="unstarted" truckerStatus="trucker_assigned" />
                <LegendItemStatus status="ongoing" truckerStatus="acknowledged" />
                <LegendItemStatus status="done" truckerStatus="acknowledged" />
                <LegendItemStatus status="invoiced" truckerStatus="acknowledged" />
                <LegendItemStatus status="cancelled" truckerStatus="acknowledged" />
            </Box>
            <Box mt={3}>
                <LegendSiteType type="loading" />
                <LegendSiteType type="unloading" />
                <LegendSiteType type="breakingResuming" />
            </Box>
        </Box>
    );
};
