import {useTimezone} from "@dashdoc/web-common";
import {Flex} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {formatDate} from "dashdoc-utils";
import {isAfter, isBefore, isEqual} from "date-fns";
import addMinutes from "date-fns/addMinutes";
import React from "react";

import {SiteSchedulerQuery} from "app/screens/scheduler/SiteSchedulerScreen";

import {getSiteActivityStartTime} from "../site-scheduler";
import {SiteSchedulerSharedActivity} from "../types";

import SiteSchedulerSlot from "./site-scheduler-slot";

const SiteSchedulerRowContentContainer = styled(Flex)`
    height: 54px;
    flex-direction: column;
    justify-content: space-between;
`;

function getSiteActivitiesForSlot(
    siteActivities: SiteSchedulerSharedActivity[],
    slotsPerRow: number,
    rowHour: Date,
    slotIndex: number,
    timezone: string
) {
    const slotDuration = 60 / slotsPerRow;
    const currentSlotStartTime = addMinutes(rowHour, slotDuration * slotIndex);
    const nextSlotStartTime = addMinutes(currentSlotStartTime, slotDuration * (slotIndex + 1));
    return siteActivities.filter((siteActivity: SiteSchedulerSharedActivity) => {
        const start = getSiteActivityStartTime(siteActivity, timezone);
        return (
            // @ts-ignore
            isEqual(start, currentSlotStartTime) ||
            // @ts-ignore
            (isAfter(start, currentSlotStartTime) && isBefore(start, nextSlotStartTime))
        );
    });
}

type SiteSchedulerRowContent = {
    hour: Date;
    siteActivities: SiteSchedulerSharedActivity[];
    filters: SiteSchedulerQuery;
    slotsPerRow: number;
    onCardSelected: (activity: SiteSchedulerSharedActivity) => void;
};

export default function SiteSchedulerRowContent({
    hour,
    siteActivities,
    filters,
    slotsPerRow,
    onCardSelected,
}: SiteSchedulerRowContent) {
    const timezone = useTimezone();

    return (
        <SiteSchedulerRowContentContainer id={`site-scheduler-time-row-${formatDate(hour, "H")}`}>
            {[...Array(slotsPerRow)].map((_1, index: number) => {
                return (
                    <SiteSchedulerSlot
                        key={index}
                        siteActivities={getSiteActivitiesForSlot(
                            siteActivities,
                            slotsPerRow,
                            hour,
                            index,
                            timezone
                        )}
                        onCardSelected={onCardSelected}
                        filters={filters}
                    />
                );
            })}
        </SiteSchedulerRowContentContainer>
    );
}
