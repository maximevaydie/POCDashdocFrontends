import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import {DateAndTime} from "@dashdoc/web-ui";
import {getSiteZonedAskedDateTimes} from "dashdoc-utils";
import React from "react";

import type {Delivery} from "app/types/transport";

type Props = {
    delivery: Delivery;
};

export function TransportDeliveryInfo({delivery}: Props) {
    const origin = delivery.origin;
    const destination = delivery.destination;

    const timezone = useTimezone();
    const {zonedStart: originStart, zonedEnd: originEnd} = getSiteZonedAskedDateTimes(
        origin,
        timezone
    );
    const {zonedStart: destinationStart, zonedEnd: destinationEnd} = getSiteZonedAskedDateTimes(
        destination,
        timezone
    );

    return (
        <Flex flexDirection="column" mb={5}>
            <Text variant="title">{t("updateLateTransports.loadingAndUnloading")}</Text>
            <Flex flexDirection="column">
                <Flex>
                    <Flex minWidth="80px">
                        <Text color="grey.dark" pb={4}>
                            {t("common.date")}
                        </Text>
                    </Flex>
                    <Box minWidth="125px" mr={1} data-testid="late-transport-origin-arrival-time">
                        <DateAndTime zonedDateTimeMin={originStart} zonedDateTimeMax={originEnd} />
                    </Box>
                    <Box
                        minWidth="125px"
                        mr={1}
                        data-testid="late-transport-destination-arrival-time"
                    >
                        <DateAndTime
                            zonedDateTimeMin={destinationStart}
                            zonedDateTimeMax={destinationEnd}
                        />
                    </Box>
                </Flex>
                <Flex>
                    <Flex minWidth="80px">
                        <Text color="grey.dark">{t("common.company")}</Text>
                    </Flex>
                    <Flex minWidth="125px" mr={1}>
                        <Text data-testid="late-transport-origin-address-company">
                            {origin.address?.company?.name}
                        </Text>
                    </Flex>
                    <Flex minWidth="125px" mr={1}>
                        <Text data-testid="late-transport-destination-address-company">
                            {destination.address?.company?.name}
                        </Text>
                    </Flex>
                </Flex>
                <Flex>
                    <Flex minWidth="80px">
                        <Text color="grey.dark">{t("common.address")}</Text>
                    </Flex>
                    <Flex minWidth="125px" mr={1}>
                        <Text data-testid="late-transport-origin-address">
                            {origin.address?.name || origin.address?.city}
                        </Text>
                    </Flex>
                    <Flex minWidth="125px" mr={1}>
                        <Text data-testid="late-transport-destination-address">
                            {destination.address?.name || destination.address?.city}
                        </Text>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
}
