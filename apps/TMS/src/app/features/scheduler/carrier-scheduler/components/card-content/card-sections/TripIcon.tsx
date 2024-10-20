import {Flex, Icon} from "@dashdoc/web-ui";
import React from "react";

import {Decoration} from "app/features/scheduler/carrier-scheduler/carrierScheduler.types";

export function TripIcon({decoration}: {decoration: Decoration}) {
    return (
        <Flex
            width="20px"
            height="20px"
            borderRadius="50%"
            alignItems="center"
            justifyContent="center"
            backgroundColor="grey.white"
            lineHeight="0.9em"
            fontSize="0.9em"
            mr={"-8%"}
            border="1px solid"
            borderColor={decoration.color}
        >
            <Icon name="trip" color={decoration.color} />
        </Flex>
    );
}
