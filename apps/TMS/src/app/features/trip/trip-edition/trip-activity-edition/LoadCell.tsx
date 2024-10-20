import {Box, Flex, Icon, NoWrap, Text} from "@dashdoc/web-ui";
import React, {ReactNode} from "react";

import {getLoadCategoryAndDescription} from "app/features/transport/transport-details/transport-details-activities/activity/activity-loads/utils";
import {getLoadQuantities} from "app/services/transport/load.service";

import type {Load} from "app/types/transport";

type Props = {
    load: Load;
    index: number;
    loads: Load[];
    badge?: ReactNode;
};

export function LoadCell({load, index, loads, badge}: Props) {
    const lastOne = index + 1 === loads.length;
    return (
        <Flex
            key={load.uid}
            alignItems="center"
            justifyContent={"space-between"}
            borderBottom={lastOne ? "none" : "1px solid"}
            borderColor="grey.light"
            mx={2}
            pb={2}
        >
            <Box flex={1}>
                <Flex>
                    <Icon name="archive" mr={2} color="grey.dark" />
                    <Text flex={1} fontWeight={400} color="grey.dark" mr={2}>
                        <NoWrap>{getLoadCategoryAndDescription(load)}</NoWrap>
                    </Text>
                    <Text variant="caption" color="grey.dark">
                        {getLoadQuantities(load)}
                    </Text>
                </Flex>
                {badge}
            </Box>
        </Flex>
    );
}
