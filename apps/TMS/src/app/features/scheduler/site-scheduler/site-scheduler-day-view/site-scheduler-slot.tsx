import {Box, Flex} from "@dashdoc/web-ui";
import React from "react";

import {SiteSchedulerQuery} from "app/screens/scheduler/SiteSchedulerScreen";

import SiteSchedulerCard from "../site-scheduler-card";
import {SiteSchedulerSharedActivity} from "../types";

type SiteSchedulerSlotsProps = {
    siteActivities: SiteSchedulerSharedActivity[];
    filters: SiteSchedulerQuery;
    onCardSelected: (activity: SiteSchedulerSharedActivity) => void;
    untimed?: boolean;
};

const isActivityFiltered = (
    sharedActivity: SiteSchedulerSharedActivity,
    filters: SiteSchedulerQuery
) => {
    const notInSelectedShippers =
        // @ts-ignore
        filters?.shipper__in.length > 0 &&
        // @ts-ignore
        !filters.shipper__in.includes(sharedActivity.activities[0].transport.shipper.toString());
    const notInSelectedCarriers =
        // @ts-ignore
        filters?.carrier__in.length > 0 &&
        // @ts-ignore
        !filters.carrier__in.includes(sharedActivity.activities[0].transport.carrier?.toString());

    return notInSelectedShippers || notInSelectedCarriers;
};

export default function SiteSchedulerSlot({
    siteActivities,
    onCardSelected,
    filters,
    untimed,
}: SiteSchedulerSlotsProps) {
    return (
        <Flex width="fit-content">
            {siteActivities.map((activity, index) => {
                const isFiltered = isActivityFiltered(activity, filters);
                return (
                    <Box key={index} marginLeft="8px">
                        <SiteSchedulerCard
                            onCardSelected={onCardSelected}
                            siteActivity={activity}
                            isFiltered={isFiltered}
                            testId={`site-scheduler-card-${untimed ? "untimed" : "timed"}`}
                        />
                    </Box>
                );
            })}
        </Flex>
    );
}
