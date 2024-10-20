import {Flex, Text, Icon} from "@dashdoc/web-ui";
import {RequestedVehicle} from "dashdoc-utils";
import React from "react";

import {CardLineHeight} from "../cardLineHeights.constants";
export function RequestedVehicleLabel({
    requestedVehicles,
}: {
    requestedVehicles: RequestedVehicle[];
}) {
    return (
        <Flex maxWidth="100%" height={`${CardLineHeight.vehicleRequested}px`} alignItems="center">
            <Icon name="truck" fontSize={0} color="grey.dark" mr={1} />
            <Text color="grey.dark" variant="subcaption" alignItems="center" ellipsis>
                {requestedVehicles.map(({label}) => label).join(" - ")}
            </Text>
        </Flex>
    );
}
