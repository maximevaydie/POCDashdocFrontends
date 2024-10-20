import {Flex, Icon, FlexProps} from "@dashdoc/web-ui";
import React, {ReactNode} from "react";

import {siteTypeIcons} from "app/features/scheduler/carrier-scheduler/components/card-content/status.constants";

import {SchedulerActivitiesForCard} from "../cardActivity.types";

export function ActivityTimelineIcon({
    activity,
    color,
    backgroundColor,
    warning,
    error,
    label,
}: {
    activity: SchedulerActivitiesForCard;
    color: string;
    backgroundColor: string;
    warning?: boolean;
    error?: boolean;
    label?: ReactNode;
}) {
    return activity.isDeletedOrCancelled ? (
        <ActivityTimelineIconWrapper
            borderColor={"grey.white"}
            backgroundColor={"grey.white"}
            color={"red.default"}
            data-testid={`cancelled-site-category`}
        >
            <Icon name="cancel" strokeWidth={2.8} scale={0.9} />
        </ActivityTimelineIconWrapper>
    ) : color && activity.category ? (
        <ActivityTimelineIconWrapper
            {...getStatusColor()}
            data-testid={`${activity.category}-site-category`}
        >
            {label ?? <Icon name={siteTypeIcons[activity.category]} strokeWidth={2.8} />}
        </ActivityTimelineIconWrapper>
    ) : null;

    function getStatusColor() {
        if (error) {
            return {
                borderColor: "red.default",
                backgroundColor: "grey.white",
                color: "red.default",
            };
        }
        if (warning) {
            return {
                borderColor: "yellow.dark",
                backgroundColor: "yellow.ultralight",
                color: "yellow.dark",
            };
        }
        if (activity.siteDone) {
            return {
                borderColor: backgroundColor,
                backgroundColor: backgroundColor,
                color: color,
            };
        }
        if (activity.onSite) {
            return {
                borderColor: color,
                backgroundColor: color,
                color: "grey.white",
            };
        }
        return {
            borderColor: color,
            backgroundColor: "grey.white",
            color: color,
        };
    }
}

export function ActivityTimelineIconWrapper({
    children,
    ...props
}: FlexProps & {children: ReactNode; color: string}) {
    return (
        <Flex
            flexShrink={0}
            justifyContent="center"
            alignItems="center"
            width="fit-content"
            height="fit-content"
            borderRadius={"50%"}
            borderColor="white !important"
            border="2px solid"
            mr={1}
            ml={"-3px"}
        >
            <Flex
                justifyContent="center"
                alignItems="center"
                width="16px"
                height="16px"
                borderRadius={"50%"}
                border="2px solid"
                fontSize="8px"
                lineHeight="8px"
                {...props}
            >
                {children}
            </Flex>
        </Flex>
    );
}
