import {Flex, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";

import {SiteSchedulerQuery} from "app/screens/scheduler/SiteSchedulerScreen";

import {SiteSchedulerSharedActivity} from "../types";

import SiteSchedulerRowContent from "./site-scheduler-row-content";

type SiteSchedulerRowProps = {
    index: number;
    hour: Date;
    slotsPerRow: number;
    siteActivities: SiteSchedulerSharedActivity[];
    onCardSelected: (activity: SiteSchedulerSharedActivity) => void;
    filters: SiteSchedulerQuery;
};

const SiteSchedulerRowContainer = styled(Flex)<{index: number}>`
    flex-direction: column;
    justify-content: center;
    height: 72px;
    border-top: ${(props) => (props.index === 0 ? "" : `solid 2px ${theme.colors.grey.light}`)};
`;

export default function SiteSchedulerRow({
    index,
    hour,
    slotsPerRow,
    siteActivities,
    onCardSelected,
    filters,
}: SiteSchedulerRowProps) {
    return (
        <SiteSchedulerRowContainer index={index}>
            <SiteSchedulerRowContent
                hour={hour}
                slotsPerRow={slotsPerRow}
                siteActivities={siteActivities}
                filters={filters}
                onCardSelected={onCardSelected}
            />
        </SiteSchedulerRowContainer>
    );
}
