import {Flex, Icon, FlexProps} from "@dashdoc/web-ui";
import React, {ReactNode} from "react";

import {
    siteTypeIcons,
    StatusColors,
} from "app/features/scheduler/carrier-scheduler/components/card-content/status.constants";

import {SchedulerActivitiesForCard} from "../cardActivity.types";

export function ActivityIcon({
    activity,
    color,
}: {
    activity: SchedulerActivitiesForCard;
    color: string;
}) {
    return activity.isDeletedOrCancelled ? (
        <ActivityIconWrapper
            borderColor={"transparent"}
            backgroundColor={"transparent"}
            color={StatusColors.CANCELLED}
            data-testid={`cancelled-site-category`}
        >
            <Icon name="cancel" strokeWidth={2.8} />
        </ActivityIconWrapper>
    ) : color && activity.category ? (
        <ActivityIconWrapper
            {...getStatusColor()}
            data-testid={`${activity.category}-site-category`}
        >
            <Icon name={siteTypeIcons[activity.category]} strokeWidth={2.8} />
        </ActivityIconWrapper>
    ) : null;

    function getStatusColor() {
        if (activity.siteDone) {
            return {
                borderColor: "transparent",
                backgroundColor: "transparent",
                color: color,
            };
        }
        if (activity.onSite) {
            return {
                borderColor: color,
                backgroundColor: "grey.white",
                color: color,
            };
        }
        return {
            borderColor: "transparent",
            backgroundColor: "grey.white",
            color: "grey.dark",
        };
    }
}

function ActivityIconWrapper({
    children,
    ...props
}: FlexProps & {children: ReactNode; color: string}) {
    return (
        <Flex
            flexShrink={0}
            justifyContent="center"
            alignItems="center"
            borderRadius={"50%"}
            width="14px"
            height="14px"
            mr={1}
            ml={"-3px"}
            style={{boxSizing: "content-box"}}
            border={"1px solid"}
            fontSize="9px"
            lineHeight="9px"
            {...props}
        >
            {children}
        </Flex>
    );
}
