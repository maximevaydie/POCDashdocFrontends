import {Flex, IconButton, Text} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import React from "react";

import {SiteSchedulerQuery} from "app/screens/scheduler/SiteSchedulerScreen";

import {SiteSchedulerSharedActivity} from "../types";

import SiteSchedulerUntimedSlot from "./site-scheduler-untimed-slot";

const HeaderButton = (props: any) => (
    <IconButton
        {...props}
        textAlign="center"
        color="grey.ultradark"
        alignItems="center"
        fontSize="20px"
    />
);

const HeaderText = (props: any) => <Text {...props} textAlign="center" width="48px" />;

type SiteSchedulerHeaderProps = {
    currentDay: Date;
    untimedSiteActivities: SiteSchedulerSharedActivity[];
    onNextDayClicked?: () => void;
    onPreviousDayClicked?: () => void;
    onCardSelected: (siteActivity: SiteSchedulerSharedActivity) => void;
    hasNoInvitedSites: boolean;
    filters: SiteSchedulerQuery;
};

export default function SiteSchedulerHeader({
    currentDay,
    untimedSiteActivities,
    onNextDayClicked,
    onPreviousDayClicked,
    onCardSelected,
    hasNoInvitedSites,
    filters,
}: SiteSchedulerHeaderProps) {
    return (
        <Flex flexDirection={"column"}>
            <Flex justifyContent={"space-between"} marginBottom={"12px"}>
                <HeaderButton
                    name={"arrowLeft"}
                    onClick={onPreviousDayClicked}
                    disabled={hasNoInvitedSites}
                />
                <Flex flexDirection={"column"} alignItems={"center"}>
                    <HeaderText>{`${formatDate(currentDay, "MMM")}`}</HeaderText>
                    <HeaderText variant="title">{`${formatDate(currentDay, "dd")}.`}</HeaderText>
                </Flex>
                <HeaderButton
                    name={"arrowRight"}
                    onClick={onNextDayClicked}
                    disabled={hasNoInvitedSites}
                />
            </Flex>
            <SiteSchedulerUntimedSlot
                untimedSiteActivities={untimedSiteActivities}
                onCardSelected={onCardSelected}
                hasNoInvitedSites={hasNoInvitedSites}
                filters={filters}
            />
        </Flex>
    );
}
