import {t} from "@dashdoc/web-core";
import {Box, Icon, Text} from "@dashdoc/web-ui";
import {TooltipWrapper} from "@dashdoc/web-ui";
import React from "react";

import {CharteringView} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/chartering-scheduler.types";
import {DedicatedResourcesView} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";

import {LegendCharteringContent} from "./components/LegendCharteringContent";
import {LegendContent} from "./components/LegendContent";

export function Legend({
    viewMode,
}: {
    viewMode: TripSchedulerView | CharteringView | DedicatedResourcesView;
}) {
    return (
        <TooltipWrapper
            content={
                <Box overflowY="auto">
                    <Text fontWeight="bold" mx={3} mt={2}>
                        {t("scheduler.legend")}
                    </Text>
                    {viewMode === "chartering" || viewMode === "dedicated_resources" ? (
                        <LegendCharteringContent />
                    ) : (
                        <LegendContent viewMode={viewMode} />
                    )}
                </Box>
            }
            delayShow={500}
        >
            <Icon pt={1} ml={3} name="info" />
        </TooltipWrapper>
    );
}
