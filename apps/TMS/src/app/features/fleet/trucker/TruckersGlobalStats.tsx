import {t} from "@dashdoc/web-core";
import {Flex, Text, Box, LoadingWheel} from "@dashdoc/web-ui";
import React from "react";

import useSimpleFetch from "app/hooks/useSimpleFetch";

export function TruckersGlobalStats() {
    const {isLoading, data: truckerGlobalStats} = useSimpleFetch<{
        invited: number;
        subscribed: number;
        active: number;
        active_last_version: number;
    }>("/stats/truckers/", [], "web");

    return (
        <Flex
            height="104px"
            width="100%"
            backgroundColor="grey.white"
            paddingX={6}
            paddingY={3}
            boxShadow="0px 1px 4px 0px #27333F1A"
        >
            {isLoading ? (
                <LoadingWheel noMargin />
            ) : (
                <>
                    <Flex flexDirection="column" flex={1} style={{gap: 10}}>
                        <Text variant="h1">{t("stats.totalTruckers")}</Text>
                        <Flex>
                            <Flex flexDirection="column" flex={1}>
                                <Text variant="title">{truckerGlobalStats.invited}</Text>
                                <Text variant="body">{t("stats.invitedTruckers")}</Text>
                            </Flex>
                            <Flex flexDirection="column" flex={1}>
                                <Text variant="title">{truckerGlobalStats.subscribed}</Text>
                                <Text variant="body">{t("stats.signedUpTruckers")}</Text>
                            </Flex>
                        </Flex>
                    </Flex>
                    <Box width={2} bg="grey.light" marginX={10} />
                    <Flex flexDirection="column" flex={1} style={{gap: 10}}>
                        <Text variant="h1">
                            {t("subscription.truckersUsageTooltip.activeTruckerTitle")}
                        </Text>
                        <Flex>
                            <Flex flexDirection="column" flex={1}>
                                <Text variant="title">{truckerGlobalStats.active}</Text>
                                <Text variant="body">{t("stats.weeklyActiveTruckers")}</Text>
                            </Flex>
                            <Flex flexDirection="column" flex={1}>
                                <Text variant="title">
                                    {truckerGlobalStats.active_last_version}
                                </Text>
                                <Text variant="body">
                                    {t("stats.weeklyActiveTruckersWithLastVersion")}
                                </Text>
                            </Flex>
                        </Flex>
                    </Flex>
                </>
            )}
        </Flex>
    );
}
