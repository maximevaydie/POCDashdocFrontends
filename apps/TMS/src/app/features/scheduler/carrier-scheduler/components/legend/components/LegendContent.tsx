import {getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon} from "@dashdoc/web-ui";
import React from "react";

import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {useSelector} from "app/redux/hooks";

import {LegendItemStatus} from "./LegendItemStatus";
import {LegendSiteType} from "./LegendSiteType";

export const LegendContent = ({viewMode}: {viewMode: TripSchedulerView}) => {
    const hasTripStartEnd = useSelector(
        (state) => getConnectedCompany(state)?.settings?.trip_start_end
    );
    return (
        <Box p={2}>
            <Box borderBottom="1px solid" borderColor="grey.light" pb={2}>
                <LegendItemStatus status="unstarted" truckerStatus="trucker_assigned" />
                <LegendItemStatus status="unstarted" truckerStatus="mission_sent_to_trucker" />
                <LegendItemStatus status="unstarted" truckerStatus="acknowledged" />
                <LegendItemStatus status="ongoing" truckerStatus="acknowledged" />
                <LegendItemStatus status="done" truckerStatus="acknowledged" />
                <LegendItemStatus status="verified" truckerStatus="acknowledged" />
                <LegendItemStatus status="invoiced" truckerStatus="acknowledged" />
            </Box>
            <Box mt={2} borderBottom="1px solid" borderColor="grey.light" pb={2}>
                {hasTripStartEnd && <LegendSiteType type="trip_start" />}
                <LegendSiteType type="loading" />
                <LegendSiteType type="unloading" />
                <LegendSiteType type="breakingResuming" />
                {hasTripStartEnd && <LegendSiteType type="trip_end" />}
            </Box>
            <Flex
                mt={2}
                borderBottom="1px solid"
                borderColor="grey.light"
                alignItems="center"
                pb={2}
            >
                <Flex
                    width="25px"
                    height="25px"
                    backgroundColor="grey.white"
                    borderRadius="50%"
                    alignItems="center"
                    justifyContent="center"
                    fontSize={1}
                    lineHeight={"12px"}
                >
                    <Icon name="trip" color="grey.dark" />
                </Flex>
                <Box p={2}>{t("common.trip")}</Box>
            </Flex>
            <Flex mt={2} alignItems="center">
                <Box
                    width="25px"
                    height="25px"
                    backgroundColor="red.default"
                    borderRadius="50%"
                    alignItems="center"
                    justifyContent="center"
                    fontSize={1}
                    lineHeight={"12px"}
                />

                <Box p={2}>
                    {viewMode === "trucker"
                        ? t("components.absence")
                        : t("components.unavailability")}
                </Box>
            </Flex>
        </Box>
    );
};
