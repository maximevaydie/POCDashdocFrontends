import {Flex, IconButton} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {
    SimilarActivityWithTransportData,
    TransportBadgeVariant,
} from "app/features/trip/trip.types";

import {ActivityContent} from "./activity-content";

export const MergedActivity: FunctionComponent<{
    mergedActivity: SimilarActivityWithTransportData;
    index: number | "similar";
    isCollapsed: boolean;
    setCollapsedActivities: () => void;
    getBadgeVariantByTransportUid: (transportUid: string) => TransportBadgeVariant;
}> = ({
    mergedActivity,
    index,
    isCollapsed,
    setCollapsedActivities,
    getBadgeVariantByTransportUid,
}) => {
    const collapseActivities = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setCollapsedActivities();
    };
    return (
        <Flex
            flex={1}
            m={-2}
            ml={-3}
            position="relative"
            data-testid={"trip-activity-item" + index}
        >
            <Flex width="100%" p={2} pl={3} alignItems="center" height="100%">
                <ActivityContent
                    activity={mergedActivity}
                    index={index}
                    numberOfActivities={mergedActivity.similarUids?.length}
                    linkedToSimilar={isCollapsed ? null : "first"}
                    getBadgeVariantByTransportUid={getBadgeVariantByTransportUid}
                />
            </Flex>
            <Flex alignItems="center" position="absolute" right="-37px" top={0} bottom={0}>
                <IconButton
                    name={isCollapsed ? "arrowRight" : "arrowDown"}
                    onClick={collapseActivities}
                    scale={[1.4, 1.4]}
                    color="grey.default"
                    data-testid="fold-or-unfold-activity-button"
                />
            </Flex>
        </Flex>
    );
};
