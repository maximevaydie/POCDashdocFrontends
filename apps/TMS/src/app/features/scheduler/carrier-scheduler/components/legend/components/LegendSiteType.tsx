import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon} from "@dashdoc/web-ui";
import React from "react";

import {
    siteTypeIcons,
    siteTypeLabels,
} from "app/features/scheduler/carrier-scheduler/components/card-content/status.constants";

export function LegendSiteType({
    type,
}: {
    type: "loading" | "unloading" | "breakingResuming" | "trip_start" | "trip_end";
}) {
    return (
        <Flex alignItems="center" width="250px">
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
                <Icon name={siteTypeIcons[type]} color="grey.dark" strokeWidth={2.5} />
            </Flex>
            {type && <Box p={2}>{t(siteTypeLabels[type])}</Box>}
        </Flex>
    );
}
