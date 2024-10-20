import {t} from "@dashdoc/web-core";
import {Box, Flex, Text, theme} from "@dashdoc/web-ui";
import React from "react";

import {SiteSchedulerQuery} from "app/screens/scheduler/SiteSchedulerScreen";

import {SiteSchedulerSharedActivity} from "../types";

import SiteSchedulerSlot from "./site-scheduler-slot";

type SiteSchedulerUntimedSlot = {
    untimedSiteActivities: SiteSchedulerSharedActivity[];
    onCardSelected: (siteActivity: SiteSchedulerSharedActivity) => void;
    hasNoInvitedSites: boolean;
    filters: SiteSchedulerQuery;
};
export default function SiteSchedulerUntimedSlot({
    untimedSiteActivities,
    onCardSelected,
    hasNoInvitedSites,
    filters,
}: SiteSchedulerUntimedSlot) {
    return (
        <Flex
            borderBottom={`2px solid ${theme.colors.grey.light}`}
            css={{display: hasNoInvitedSites ? "none" : ""}}
        >
            <Box flex={"0 72px"} borderRight={`2px solid ${theme.colors.grey.light}`}>
                <Text color="grey.dark" variant="caption" textAlign={"center"}>
                    {t("siteScheduler.undefinedHours")}
                </Text>
            </Box>
            <Box overflowX="auto" flex="1">
                <SiteSchedulerSlot
                    siteActivities={untimedSiteActivities}
                    onCardSelected={onCardSelected}
                    filters={filters}
                    untimed={true}
                />
            </Box>
        </Flex>
    );
}
