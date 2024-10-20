import {Box, Flex, TabTitle} from "@dashdoc/web-ui";
import React, {ReactNode} from "react";

import {getTabTranslations} from "app/common/tabs";
import {PoolFilteringBar} from "app/features/scheduler/carrier-scheduler/trip-scheduler/unplanned-trips/PoolFilteringBar";
import {SidebarTabNames} from "app/types/constants";

export function PoolHeader({children}: {children: ReactNode}) {
    return (
        <>
            <Flex justifyContent="space-between">
                <Box pb={4} mb={1}>
                    <TabTitle title={getTabTranslations(SidebarTabNames.SCHEDULER)} />
                </Box>
                {children}
            </Flex>
            <PoolFilteringBar filteringBarId="pool-filtering-bar" />
        </>
    );
}
