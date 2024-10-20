import {Box, Flex} from "@dashdoc/web-ui";
import React from "react";

import {ActivityMarker} from "app/features/maps/marker/activity-marker";
type Props = {
    index: number | "similar";
    linkedToNext?: boolean;
    linkedToPrevious?: boolean;
};
export function ActivityIndex({index, linkedToNext, linkedToPrevious}: Props) {
    return (
        <Flex position="relative" alignItems="center" my={-2} py={2}>
            {(linkedToNext || linkedToPrevious) && (
                <Box
                    height={
                        linkedToNext && linkedToPrevious ? "calc(100% + 2px)" : "calc(50% + 1px)"
                    }
                    position="absolute"
                    width="1px"
                    bg={"blue.dark"}
                    bottom={linkedToPrevious && !linkedToNext ? "50%" : "-1px"}
                    left="1.15em"
                ></Box>
            )}
            <Box zIndex="level1">
                <ActivityMarker
                    activityStatus={"not_started"}
                    activityIndex={"similar" === index ? index : (index as number) + 1}
                    category={undefined}
                    hasBackground={true}
                    boxShadow={"none"}
                    border="none"
                />
            </Box>
        </Flex>
    );
}
