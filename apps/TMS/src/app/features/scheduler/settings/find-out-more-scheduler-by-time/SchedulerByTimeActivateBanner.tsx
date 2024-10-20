import {t} from "@dashdoc/web-core";
import {Flex, Text} from "@dashdoc/web-ui";
import React from "react";

import {SchedulerByTimeFindOutMore} from "./SchedulerByTimeFindOutMore";

export function SchedulerByTimeActivateBanner() {
    return (
        <Flex
            width="100%"
            minHeight="40px"
            display="flex"
            backgroundColor="grey.white"
            alignItems="center"
            justifyContent="center"
            boxShadow="small"
        >
            <Text ellipsis mr={2}>
                {t("schedulerByTime.banner.new")}
            </Text>
            <SchedulerByTimeFindOutMore />
        </Flex>
    );
}
