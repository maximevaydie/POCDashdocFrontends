import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import React from "react";

import {SchedulerActivitiesForCard} from "../cardActivity.types";

export function CollapsedActivities({
    activities,
    color,
    displayActivityType,
}: {
    activities: SchedulerActivitiesForCard[];
    color: string;
    displayActivityType: boolean;
}) {
    const onSites = activities.findIndex((activity) => activity.onSite) >= 0;
    const sitesDone = activities.findIndex((activity) => activity.siteDone) === -1;
    return (
        <Flex alignItems="center" lineHeight="18px">
            {displayActivityType && color && (
                <Box
                    borderRadius={"50%"}
                    width="6px"
                    height="6px"
                    mr="9px"
                    ml="1px"
                    style={{boxSizing: "content-box"}}
                    border={"1px solid"}
                    borderColor={onSites || sitesDone ? color : "grey.white"}
                    backgroundColor={sitesDone ? "transparent" : "grey.white"}
                    data-testid={`colapsed-site-category`}
                    position="relative"
                >
                    {!onSites && !sitesDone && (
                        <Box
                            width="1px"
                            backgroundColor="grey.white"
                            height="6px"
                            top="-7px"
                            right={0}
                            left={0}
                            mx="auto"
                            position="absolute"
                        />
                    )}
                    {!sitesDone && (
                        <Box
                            width="1px"
                            backgroundColor="grey.white"
                            height="6px"
                            bottom="-7px"
                            right={0}
                            left={0}
                            mx="auto"
                            position="absolute"
                        />
                    )}
                </Box>
            )}
            {
                // eslint-disable-next-line react/jsx-no-literals
                <Text variant="caption" lineHeight={0} py="1px">
                    + {t("trip.addSelectedActivitiesNumber", {smart_count: activities.length})}
                </Text>
            }
        </Flex>
    );
}
